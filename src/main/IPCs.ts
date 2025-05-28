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
      const documentsFolder = path.join(process.env.HOME, 'Documents')
      const ravenCharacterBuilderFolder = path.join(documentsFolder, 'Raven Character Builder')
      const customFolder = path.join(ravenCharacterBuilderFolder, 'custom')

      fs.mkdirSync(ravenCharacterBuilderFolder, { recursive: true })
      // Make the ravenCM and custom directories if they don't exist
      if (!fs.existsSync(ravenCharacterBuilderFolder)) {
        fs.mkdirSync(ravenCharacterBuilderFolder, { recursive: true })
      }
      if (!fs.existsSync(customFolder)) {
      }

      // Download the index file
      const parsedUrl = new URL(url)
      const indexFileName = path.basename(parsedUrl.pathname)

      // Gets the index file from the url, and then with the response, we save it to the custom folder.
      axios
        .get(url)
        .then((response) => {
          const indexFileContent = response.data
          const indexFilePath = path.join(customFolder, indexFileName)

          fs.writeFile(indexFilePath, indexFileContent, (err) => {
            // else {
            //   console.log('Index file downloaded and saved to:', indexFilePath)
          })

          // Parse XML content and extract URLs
          const parser = new xml2js.Parser()
          parser.parseString(indexFileContent, (err, result) => {
            if (err) {
              console.error(err)
            } else {
              // Make the folder from the index file name
              const files = result.index.files[0].file
              const fileName = path.basename(indexFileName, path.extname(indexFileName))
              const downloadsFolder = path.join(customFolder, fileName)

              if (!fs.existsSync(downloadsFolder)) {
                fs.mkdirSync(downloadsFolder, { recursive: true })
              }
              const urls = files.map((file) => file.$.url)

              // Download files from URLs
              urls.forEach((url) => {
                const fileContentUrl = path.basename(url)

                const downloadFilePath = path.join(downloadsFolder, fileContentUrl)

                axios
                  .get(url)
                  .then((response) => {
                    const fileContent = response.data
                    fs.writeFile(downloadFilePath, fileContent, (err) => {
                      //   console.log(`Downloaded file saved to: ${downloadFilePath}`)
                    })
                    // Check if the downloaded file is an index file
                    if (path.extname(url) === '.index') {
                      // Parse the index file and extract URLs
                      const parser = new xml2js.Parser()
                      parser.parseString(fileContent, (err, result) => {
                        if (err) {
                          console.error(err)
                        } else {
                          const files = result.index.files[0].file
                          const indexFileName = path.basename(url, path.extname(url))
                          const indexFolder = path.join(downloadsFolder, indexFileName)

                          if (!fs.existsSync(indexFolder)) {
                            fs.mkdirSync(indexFolder, { recursive: true })
                          }
                          const urls = files.map((file) => file.$.url)

                          // Download files from URLs
                          urls.forEach((url) => {
                            const fileContentUrl = path.basename(url)
                            const downloadFilePath = path.join(indexFolder, fileContentUrl)

                            axios
                              .get(url)
                              .then((response) => {
                                const fileContent = response.data
                                fs.writeFile(downloadFilePath, fileContent, (err) => {
                                  // else {
                                  //   console.log(`Downloaded file saved to: ${downloadFilePath}`)
                                  // }

                                if (path.extname(url) === '.index') {
                                  // downloadIndex(url, indexFolder)
                                  console.log("oop?")
                                }
                              })
                              .catch((error) => {
                                console.error(error)
                              })
                          })
                        }
                      })
                    }
                  })
                  .catch((error) => {
                    console.error(error)
                  })
              })
            }
          })
        })
        .catch((error) => {
          console.error(error)
        })
    })

    ipcMain.on('msgOpenContentFolder', async (event: IpcMainEvent) => {
      const documentsFolder = path.join(process.env.HOME, 'Documents')
      const ravenCharacterBuilderFolder = path.join(documentsFolder, 'Raven Character Builder')
      shell.openPath(ravenCharacterBuilderFolder)
    })
  }
}
