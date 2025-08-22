import { ipcMain, shell, IpcMainEvent, dialog } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import * as xml2js from 'xml2js'
import axios from 'axios'
import Constants from './utils/Constants'

/*
 * IPC Communications
 * */
export default class IPCs {
  static initialize(): void {
    // Get application version
    ipcMain.handle('msgRequestGetVersion', () => {
      return Constants.APP_VERSION
    })

    // Open url via web browser
    ipcMain.on('msgOpenExternalLink', async (event: IpcMainEvent, url: string) => {
      await shell.openExternal(url)
    })

    // Open file
    ipcMain.handle('msgOpenFile', async (event: IpcMainEvent, filter: string) => {
      const filters = []
      if (filter === 'dnd5e') {
        filters.push({ name: 'DnD5e', extensions: ['DnD5e'] })
      } else if (filter === 'text') {
        filters.push({ name: 'Text', extensions: ['txt', 'json'] })
      } else if (filter === 'zip') {
        filters.push({ name: 'Zip', extensions: ['zip'] })
      }
      const dialogResult = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters
      })
      return dialogResult
    })

    // Save character
    ipcMain.handle('msgSaveCharacter', async (event: IpcMainEvent, data: any) => {
      console.log(data)
      const characterFolder = 'GameCharacters'
      const fileName = `${data.characterName}.DnD5e`

      // Create the GameCharacters folder if it doesn't exist
      if (!fs.existsSync(characterFolder)) {
        fs.mkdirSync(characterFolder)
      }

      // Create the XML file
      const filePath = path.join(characterFolder, fileName)
      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
  <character version="1.0.0">
  <!-- information -->
	<information>
		<group>${data.group}</group>
		<generationOption>${data.generationOption}</generationOption>
	</information>
	<!-- display data -->
	<display-properties favorite="true">
    <name>${data.characterName}</name>
    <race>${data.race}</race>
		<class>${data.class}</class>
		<archetype>${data.archetype}
		</archetype>
		<background>${data.background}</background>
		<level>${data.level}</level>

    <abilityGenerationOption>${data.abilityGenerationOption}</abilityGenerationOption>
  </display-properties>
  <!-- build data -->
  <build>
  <name>${data.characterName}</name>
    <input>
      <gender>${data.pronouns}</gender>
      <player-name>${data.playerName}</player-name>
			<experience>${data.characterExperience}</experience>
  </character>`

      fs.writeFileSync(filePath, xmlContent)

      console.log(`Character file saved to ${filePath}`)
    })

    // Get characters saved
    ipcMain.handle('msgGetCharacters', async (event: IpcMainEvent) => {
      const gameCharactersFolder = path.join(__dirname, 'GameCharacters')

      if (!fs.existsSync(gameCharactersFolder)) {
        return []
      }

      const files = await fs.readdirSync(gameCharactersFolder)
      const characters = []

      files.forEach((file) => {
        const filePath = path.join(gameCharactersFolder, file)
        const fileContent = fs.readFileSync(filePath, 'utf8')
        const parser = new xml2js.Parser()
        parser.parseString(fileContent, (err, result) => {
          if (err) {
            console.error(err)
            return false
          } else {
            const resultWithUnderscores = JSON.parse(JSON.stringify(result).replace(/-/g, '_'))
            characters.push(resultWithUnderscores)
          }
        })
      })

      return characters
    })

    // Index Downloader (Double check for redundancy)
    ipcMain.handle('msgDownloadIndex', async (event: IpcMainEvent, url: string) => {
      try {
        const ravenCMFolder = Constants.RAVEN_FOLDER
        const customFolder = Constants.CUSTOM_FOLDER

        // Make the ravenCM and custom directories if they don't exist
        if (!fs.existsSync(ravenCMFolder)) {
          fs.mkdirSync(ravenCMFolder, { recursive: true })
        }
        if (!fs.existsSync(customFolder)) {
          fs.mkdirSync(customFolder, { recursive: true })
        }

        // Download the index file
        const parsedUrl = new URL(url)
        const indexFileName = path.basename(parsedUrl.pathname)

        console.log(`Downloading index file from: ${url}`)
        
        // Gets the index file from the url, and then with the response, we save it to the custom folder.
        const response = await axios.get(url)
        const indexFileContent = response.data
        const indexFilePath = path.join(customFolder, indexFileName)

        // Save index file synchronously to ensure it's written before proceeding
        fs.writeFileSync(indexFilePath, indexFileContent)
        console.log('Index file downloaded and saved to:', indexFilePath)

        // Parse XML content and extract URLs
        const parser = new xml2js.Parser()
        const result: any = await new Promise((resolve, reject) => {
          parser.parseString(indexFileContent, (err, result) => {
            if (err) reject(err)
            else resolve(result)
          })
        })

        // Make the folder from the index file name
        const files = result.index.files[0].file
        const fileName = path.basename(indexFileName, path.extname(indexFileName))
        const downloadsFolder = path.join(customFolder, fileName)

        if (!fs.existsSync(downloadsFolder)) {
          fs.mkdirSync(downloadsFolder, { recursive: true })
        }

        const urls = files.map((file) => file.$.url)
        console.log(`Found ${urls.length} files to download`)

        // Download files from URLs
        let downloadedCount = 0
        for (const fileUrl of urls) {
          try {
            const fileContentUrl = path.basename(fileUrl)
            const downloadFilePath = path.join(downloadsFolder, fileContentUrl)

            const fileResponse = await axios.get(fileUrl)
            const fileContent = fileResponse.data
            
            fs.writeFileSync(downloadFilePath, fileContent)
            downloadedCount++
            console.log(`Downloaded file ${downloadedCount}/${urls.length}: ${fileContentUrl}`)

            // Handle nested index files (simplified for now)
            if (path.extname(fileUrl) === '.index') {
              console.log('Found nested index file:', fileContentUrl)
              // Could recursively process nested index files here if needed
            }
          } catch (fileError) {
            console.error(`Failed to download file from ${fileUrl}:`, fileError.message)
          }
        }

        return { 
          success: true, 
          message: `Successfully downloaded ${downloadedCount} files from index`,
          downloadedFiles: downloadedCount,
          totalFiles: urls.length
        }
      } catch (error) {
        console.error('Error downloading index:', error)
        return { 
          success: false, 
          message: `Failed to download index: ${error.message}`,
          error: error.message
        }
      }
    })

    ipcMain.on('msgOpenContentFolder', async (event: IpcMainEvent) => {
      const documentsFolder = path.join(process.env.HOME, 'Documents')
      const ravenCharacterBuilderFolder = path.join(documentsFolder, 'Raven Character Builder')
      shell.openPath(ravenCharacterBuilderFolder)
    })

    ipcMain.on('msgOpenUserFolder', async (event: IpcMainEvent) => {
      const documentsFolder = path.join(process.env.HOME, 'Documents')
      const ravenCharacterBuilderFolder = path.join(documentsFolder, 'Raven Character Builder')
      const userFolder = path.join(ravenCharacterBuilderFolder, 'Custom', 'user')
      
      // Create the user folder if it doesn't exist
      if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true })
      }
      
      shell.openPath(userFolder)
    })

    // Get all races
    ipcMain.handle('msgGetAllRaces', async (event: IpcMainEvent) => {
      const raceElements = []
      const customFolder = Constants.CUSTOM_FOLDER

      const searchForRaces = (folderPath) => {
        fs.readdirSync(folderPath).forEach((file) => {
          const filePath = path.join(folderPath, file)
          const stat = fs.statSync(filePath)
          if (stat.isDirectory()) {
            searchForRaces(filePath)
          } else if (file.includes('race-') && file.endsWith('.xml')) {
            const xml = fs.readFileSync(filePath, 'utf8')
            const parser = new xml2js.Parser()
            parser.parseString(xml, (err, result) => {
              if (err) {
                console.error(err)
              } else {
                const elements = result.elements.element
                elements.forEach((element) => {
                  if (element.$.type === 'Race') {
                    const description = element.description.toString()
                    const raceElement = {
                      name: element.$.name,
                      type: element.$.type,
                      source: element.$.source,
                      id: element.$.id,
                      description
                    }
                    raceElements.push(raceElement)
                  }
                })
              }
            })
          }
        })
      }
      searchForRaces(customFolder)
      return raceElements
    })
    ipcMain.handle('msgGetAllElements', async (event: IpcMainEvent) => {
      const parsedElements = []
      const allParsedElementTypes: string[] = []
      const customFolder = Constants.CUSTOM_FOLDER

      const searchForElements = (folderPath) => {
        fs.readdirSync(folderPath).forEach((file) => {
          const filePath = path.join(folderPath, file)
          const stat = fs.statSync(filePath)
          if (stat.isDirectory()) {
            searchForElements(filePath)
          } else {
            for (const elementType of Constants.ALL_ELEMENTS) {
              if (file.endsWith('.xml')) {
                const xml = fs.readFileSync(filePath, 'utf8')
                const parser = new xml2js.Parser()
                parser.parseString(xml, (err, result) => {
                  if (err) {
                    console.error(err)
                  } else {
                    const elements = result.elements.element
                    elements.forEach((element) => {
                      if (!allParsedElementTypes.includes(element.$)) {
                        allParsedElementTypes.push(element.$)
                        const filePath = path.join(
                          Constants.CUSTOM_FOLDER,
                          'parsed_element_types.txt'
                        )
                        fs.appendFileSync(filePath, `${element.$}\n`)
                      }
                      if (element.$.type === elementType) {
                        const elementObject = {
                          name: element.$.name,
                          type: element.$.type,
                          source: element.$.source,
                          id: element.$.id,
                          description: element.description?.toString() ?? ''
                        }

                        parsedElements.push(elementObject)
                      }
                    })
                  }
                })
              }
            }
          }
        })
      }
      searchForElements(customFolder)
      console.log(allParsedElementTypes)
      return parsedElements
    })
  }
}
