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
  private static cachedElements: any[] | null = null

  private static extractText(obj: any): string {
    if (obj === null || obj === undefined) {
      return ''
    }
    if (typeof obj === 'string') {
      return obj.trim()
    }
    if (Array.isArray(obj)) {
      return obj.map(IPCs.extractText).filter(Boolean).join(' ')
    }
    if (typeof obj === 'object') {
      let text = ''
      if (obj._) {
        text += obj._.trim() + ' '
      }
      for (const key in obj) {
        if (key !== '$') {
          text += IPCs.extractText(obj[key]) + ' '
        }
      }
      return text.trim().replace(/\s+/g, ' ')
    }
    return String(obj)
  }

  private static extractRawDescription(xml: string, elementId: string): string {
    if (!elementId) return ''
    const escapedId = elementId.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    const elementRegex = new RegExp(`<element\\b[^>]*?id=["']${escapedId}["'][^>]*?>`, 'i')
    const match = xml.match(elementRegex)
    if (!match || match.index === undefined) {
      return ''
    }

    const startIdx = match.index + match[0].length
    const subXml = xml.slice(startIdx)
    
    const descStartRegex = /<description\b[^>]*?>/i
    const descStartMatch = subXml.match(descStartRegex)
    if (!descStartMatch || descStartMatch.index === undefined) {
      return ''
    }
    
    const descContentStart = descStartMatch.index + descStartMatch[0].length
    const descEndIdx = subXml.indexOf('</description>', descContentStart)
    if (descEndIdx === -1) {
      return ''
    }
    
    return subXml.slice(descContentStart, descEndIdx).trim()
  }

  public static loadElements(): any[] {
    if (this.cachedElements !== null) {
      return this.cachedElements
    }

    const parsedElements: any[] = []
    const customFolder = Constants.CUSTOM_FOLDER

    if (!fs.existsSync(customFolder)) {
      fs.mkdirSync(customFolder, { recursive: true })
    }

    const searchForElements = (folderPath: string) => {
      fs.readdirSync(folderPath).forEach((file: string) => {
        const filePath = path.join(folderPath, file)
        const stat = fs.statSync(filePath)
        if (stat.isDirectory()) {
          searchForElements(filePath)
        } else {
          for (const elementType of Constants.ALL_ELEMENTS) {
            if (file.endsWith('.xml')) {
              try {
                const xml = fs.readFileSync(filePath, 'utf8')
                const parser = new xml2js.Parser()
                parser.parseString(xml, (err, result) => {
                  if (err) {
                    console.error(err)
                  } else if (result && result.elements && result.elements.element) {
                    const elements = result.elements.element
                    elements.forEach((element: any) => {
                      if (element.$ && element.$.type === elementType) {
                        let descriptionText = ''
                        if (element.setters && element.setters[0] && element.setters[0].set) {
                          const shortSet = element.setters[0].set.find((s: any) => s.$ && s.$.name === 'short')
                          if (shortSet) {
                            descriptionText = IPCs.extractText(shortSet)
                          }
                        }
                        if (!descriptionText && element.sheet && element.sheet[0] && element.sheet[0].description) {
                          descriptionText = IPCs.extractText(element.sheet[0].description)
                        }
                        if (!descriptionText && element.description) {
                          descriptionText = IPCs.extractText(element.description)
                        }

                        const settersObj: Record<string, string> = {}
                        if (element.setters && element.setters[0] && element.setters[0].set) {
                          element.setters[0].set.forEach((set: any) => {
                            if (set.$ && set.$.name) {
                              settersObj[set.$.name] = IPCs.extractText(set)
                            }
                          })
                        }

                        const elementObject = {
                          name: element.$.name,
                          type: element.$.type,
                          source: element.$.source,
                          id: element.$.id || '',
                          description: descriptionText,
                          htmlDescription: IPCs.extractRawDescription(xml, element.$.id || ''),
                          setters: settersObj
                        }

                        parsedElements.push(elementObject)
                      }
                    })
                  }
                })
              } catch (e) {
                console.error(`Error parsing file ${filePath}:`, e)
              }
            }
          }
        }
      })
    }

    try {
      searchForElements(customFolder)
    } catch (e) {
      console.error('Error listing custom folder:', e)
    }

    this.cachedElements = parsedElements
    return this.cachedElements
  }

  static initialize(): void {
    // Load elements once on startup
    IPCs.loadElements()
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
      const folders = [
        path.join(process.cwd(), 'GameCharacters'),
        Constants.RAVEN_FOLDER
      ]
      const characters = []
      const parsedFiles = new Set<string>()

      folders.forEach((folder) => {
        if (!fs.existsSync(folder)) return
        
        try {
          const files = fs.readdirSync(folder)
          files.forEach((file) => {
            const filePath = path.join(folder, file)
            const ext = path.extname(file).toLowerCase()
            if (ext === '.dnd5e') {
              const stat = fs.statSync(filePath)
              if (stat.isFile()) {
                const fileContent = fs.readFileSync(filePath, 'utf8')
                const parser = new xml2js.Parser()
                parser.parseString(fileContent, (err, result) => {
                  if (err) {
                    console.error(`Error parsing character XML ${filePath}:`, err)
                  } else if (result && result.character) {
                    const char = result.character
                    const displayProps = char['display-properties'] ? char['display-properties'][0] : {}
                    const infoProps = char.information ? char.information[0] : {}
                    
                    let avatar = ''
                    if (displayProps.portrait && displayProps.portrait[0] && displayProps.portrait[0].base64) {
                      const b64 = displayProps.portrait[0].base64[0]
                      if (b64 && typeof b64 === 'string' && b64.trim()) {
                        avatar = `data:image/jpeg;base64,${b64.trim()}`
                      }
                    }
                    if (!avatar && displayProps.avatar) {
                      avatar = displayProps.avatar[0]
                    }

                    const characterObject = {
                      name: displayProps.name ? displayProps.name[0] : 'Unnamed',
                      avatar: avatar || '/images/icon-64px.png',
                      level: displayProps.level ? parseInt(displayProps.level[0], 10) : 1,
                      race: displayProps.race ? displayProps.race[0] : '',
                      class: displayProps.class ? displayProps.class[0] : '',
                      group: infoProps.group ? infoProps.group[0] : 'Characters',
                      alignment: displayProps.alignment ? displayProps.alignment[0] : '',
                      background: {
                        name: displayProps.background ? displayProps.background[0] : '',
                        description: '',
                        id: '',
                        source: ''
                      },
                      archetype: displayProps.archetype ? displayProps.archetype[0] : '',
                      pronouns: displayProps.gender ? displayProps.gender[0] : (char.build && char.build[0].input && char.build[0].input[0].gender ? char.build[0].input[0].gender[0] : 'Male'),
                      playerName: char.build && char.build[0].input && char.build[0].input[0]['player-name'] ? char.build[0].input[0]['player-name'][0] : '',
                      experience: char.build && char.build[0].input && char.build[0].input[0].experience ? parseInt(char.build[0].input[0].experience[0], 10) : 0,
                      abilityGenerationOption: infoProps.generationOption ? infoProps.generationOption[0] : 'Roll 4d6 - Discard Lowest',
                      languages: [],
                      feat: '',
                      proficiency: '',
                      spells: [],
                      inventory: [],
                      equipment: [],
                      filePath
                    }
                    
                    if (!parsedFiles.has(characterObject.name)) {
                      characters.push(characterObject)
                      parsedFiles.add(characterObject.name)
                    }
                  }
                })
              }
            }
          })
        } catch (e) {
          console.error(`Error scanning folder ${folder}:`, e)
        }
      })

      return characters
    })

    // Index Downloader (Double check for redundancy)
    ipcMain.handle('msgDownloadIndex', async (event: IpcMainEvent, url: string) => {
      IPCs.cachedElements = null
      const ravenCMFolder = Constants.RAVEN_FOLDER
      const customFolder = Constants.CUSTOM_FOLDER

      // Make the ravenCM and custom directories if they don't exist
      if (!fs.existsSync(ravenCMFolder)) {
        // Do we need recursiveness?
        fs.mkdirSync(ravenCMFolder, { recursive: true })
      }
      if (!fs.existsSync(customFolder)) {
        fs.mkdirSync(customFolder, { recursive: true })
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
            if (err) {
              console.error(err)
            }
            // else {
            //   console.log('Index file downloaded and saved to:', indexFilePath)
            // }
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
                      if (err) {
                        console.error(err)
                      }
                      // else {
                      //   console.log(`Downloaded file saved to: ${downloadFilePath}`)
                      // }
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
                                  if (err) {
                                    console.error(err)
                                  }
                                  // else {
                                  //   console.log(`Downloaded file saved to: ${downloadFilePath}`)
                                  // }
                                })

                                if (path.extname(url) === '.index') {
                                  // downloadIndex(url, indexFolder)
                                  console.log('oop?')
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

    // // Get all races
    // ipcMain.handle('msgGetAllRaces', async (event: IpcMainEvent) => {
    //   const raceElements = []
    //   const customFolder = Constants.CUSTOM_FOLDER

    //   const searchForRaces = (folderPath) => {
    //     fs.readdirSync(folderPath).forEach((file) => {
    //       const filePath = path.join(folderPath, file)
    //       const stat = fs.statSync(filePath)
    //       if (stat.isDirectory()) {
    //         searchForRaces(filePath)
    //       } else if (file.includes('race-') && file.endsWith('.xml')) {
    //         const xml = fs.readFileSync(filePath, 'utf8')
    //         const parser = new xml2js.Parser()
    //         parser.parseString(xml, (err, result) => {
    //           if (err) {
    //             console.error(err)
    //           } else {
    //             const elements = result.elements.element
    //             elements.forEach((element) => {
    //               if (element.$.type === 'Race') {
    //                 const description = element.description.toString()
    //                 const raceElement = {
    //                   name: element.$.name,
    //                   type: element.$.type,
    //                   source: element.$.source,
    //                   id: element.$.id,
    //                   description
    //                 }
    //                 raceElements.push(raceElement)
    //               }
    //             })
    //           }
    //         })
    //       }
    //     })
    //   }
    //   searchForRaces(customFolder)
    //   return raceElements
    // })

    // // Get all classes
    // ipcMain.handle('msgGetAllClasses', async (event: IpcMainEvent) => {
    //   const classElements = []
    //   const customFolder = Constants.CUSTOM_FOLDER

    //   const searchForClasses = (folderPath) => {
    //     fs.readdirSync(folderPath).forEach((file) => {
    //       const filePath = path.join(folderPath, file)
    //       const stat = fs.statSync(filePath)
    //       if (stat.isDirectory()) {
    //         searchForClasses(filePath)
    //       } else if (file.includes('class-') && file.endsWith('.xml')) {
    //         const xml = fs.readFileSync(filePath, 'utf8')
    //         const parser = new xml2js.Parser()
    //         parser.parseString(xml, (err, result) => {
    //           if (err) {
    //             console.error(err)
    //           } else {
    //             const elements = result.elements.element
    //             elements.forEach((element) => {
    //               if (element.$.type === 'Class') {
    //                 const description = element.description.toString()
    //                 const classElement = {
    //                   name: element.$.name,
    //                   type: element.$.type,
    //                   source: element.$.source,
    //                   id: element.$.id,
    //                   description
    //                 }
    //                 classElements.push(classElement)
    //               }
    //             })
    //           }
    //         })
    //       }
    //     })
    //   }
    //   searchForClasses(customFolder)
    //   console.log(classElements)
    //   return classElements
    // })

    ipcMain.handle('msgGetAllElements', async (event: IpcMainEvent) => {
      return IPCs.loadElements()
    })

    // Get local portrait files
    ipcMain.handle('msgGetPortraits', async (event: IpcMainEvent) => {
      const portraitsFolder = path.join(Constants.RAVEN_FOLDER, 'Portraits')
      if (!fs.existsSync(portraitsFolder)) {
        fs.mkdirSync(portraitsFolder, { recursive: true })
      }
      try {
        const files = fs.readdirSync(portraitsFolder)
        const images = []
        files.forEach((file) => {
          const filePath = path.join(portraitsFolder, file)
          const ext = path.extname(file).toLowerCase()
          if (['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext)) {
            const base64 = fs.readFileSync(filePath, 'base64')
            const mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : `image/${ext.substring(1)}`
            images.push(`data:${mimeType};base64,${base64}`)
          }
        })
        return images
      } catch (err) {
        console.error('Error reading portraits', err)
        return []
      }
    })

    // Show character file in explorer
    ipcMain.on('msgShowItemInFolder', (event: IpcMainEvent, filePath: string) => {
      if (filePath && fs.existsSync(filePath)) {
        shell.showItemInFolder(filePath)
      }
    })
  }
}
