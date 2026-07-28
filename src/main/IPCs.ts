import { ipcMain, shell, IpcMainEvent, dialog, BrowserWindow, app } from 'electron'
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

  private static getCharacterXmlContent(data: any): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<character version="1.0.0">
  <!-- information -->
  <information>
    <group>${data.group || 'Characters'}</group>
    <generationOption>${data.generationOption || 'Roll 4d6 - Discard Lowest'}</generationOption>
  </information>
  <!-- display data -->
  <display-properties favorite="true">
    <name>${data.characterName || data.name || ''}</name>
    <race>${data.race || ''}</race>
    <subrace>${data.subrace || ''}</subrace>
    <class>${data.class || ''}</class>
    <archetype>${data.archetype || ''}</archetype>
    <background>${data.background || ''}</background>
    <background-variant>${data.backgroundVariant || ''}</background-variant>
    <background-feature>${data.backgroundFeature || ''}</background-feature>
    <level>${data.level || 1}</level>
    <abilityGenerationOption>${data.abilityGenerationOption || 'Roll 4d6 - Discard Lowest'}</abilityGenerationOption>
  </display-properties>
  <!-- build data -->
  <build>
    <name>${data.characterName || data.name || ''}</name>
    <input>
      <gender>${data.pronouns || data.gender || ''}</gender>
      <player-name>${data.playerName || ''}</player-name>
      <experience>${data.characterExperience || data.experience || 0}</experience>
    </input>
  </build>
  <!-- appearance data -->
  <appearance>
    <deity>${data.deity || ''}</deity>
    <age>${data.age || ''}</age>
    <height>${data.height || ''}</height>
    <weight>${data.weight || ''}</weight>
    <eyes>${data.eyes || ''}</eyes>
    <skin>${data.skin || ''}</skin>
    <hair>${data.hair || ''}</hair>
    <additionalFeatures>${data.additionalFeatures || ''}</additionalFeatures>
  </appearance>
  <!-- abilities -->
  <abilities>
    <strength>${data.str || 10}</strength>
    <dexterity>${data.dex || 10}</dexterity>
    <constitution>${data.con || 10}</constitution>
    <intelligence>${data.int || 10}</intelligence>
    <wisdom>${data.wis || 10}</wisdom>
    <charisma>${data.cha || 10}</charisma>
  </abilities>
  <!-- stats -->
  <stats>
    <str>${data.str || 10}</str>
    <dex>${data.dex || 10}</dex>
    <con>${data.con || 10}</con>
    <int>${data.int || 10}</int>
    <wis>${data.wis || 10}</wis>
    <cha>${data.cha || 10}</cha>
    <hp>${data.hp || 10}</hp>
    <speed>${data.speed || 30}</speed>
  </stats>
  <proficient-skills>
    ${(data.proficientSkills || []).map((s: string) => `<skill>${s}</skill>`).join('')}
  </proficient-skills>
  <proficient-saving-throws>
    ${(data.proficientSavingThrows || []).map((s: string) => `<saving-throw>${s}</saving-throw>`).join('')}
  </proficient-saving-throws>
</character>`
  }

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
        if (key !== '$' && key !== '_') {
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

  public static async loadElements(): Promise<any[]> {
    if (this.cachedElements !== null) {
      return this.cachedElements
    }

    const parsedElements: any[] = []
    const customFolder = Constants.CUSTOM_FOLDER

    if (!fs.existsSync(customFolder)) {
      await fs.promises.mkdir(customFolder, { recursive: true })
    }

    const searchForElements = async (folderPath: string): Promise<void> => {
      try {
        const files = await fs.promises.readdir(folderPath)
        const tasks = files.map(async (file: string) => {
          const filePath = path.join(folderPath, file)
          try {
            const stat = await fs.promises.stat(filePath)
            if (stat.isDirectory()) {
              await searchForElements(filePath)
            } else if (file.endsWith('.xml')) {
              const xml = await fs.promises.readFile(filePath, 'utf8')
              const parser = new xml2js.Parser()
              const result = await new Promise<any>((resolve, reject) => {
                parser.parseString(xml, (err, res) => {
                  if (err) reject(err)
                  else resolve(res)
                })
              })

              if (result && result.elements && result.elements.element) {
                const elements = result.elements.element
                elements.forEach((element: any) => {
                  if (element.$ && element.$.type && Constants.ALL_ELEMENTS.includes(element.$.type)) {
                    let descriptionText = ''
                    if (element.setters && element.setters[0] && element.setters[0].set) {
                      const shortSet = element.setters[0].set.find(
                        (s: any) => s.$ && s.$.name === 'short'
                      )
                      if (shortSet) {
                        descriptionText = IPCs.extractText(shortSet)
                      }
                    }
                    if (
                      !descriptionText &&
                      element.sheet &&
                      element.sheet[0] &&
                      element.sheet[0].description
                    ) {
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

                    const rulesList: any[] = []
                    if (element.rules && element.rules[0]) {
                      const rulesNode = element.rules[0]
                      if (rulesNode.stat) {
                        rulesNode.stat.forEach((statNode: any) => {
                          if (statNode.$) {
                            rulesList.push({
                              type: 'stat',
                              name: statNode.$.name,
                              value: statNode.$.value,
                              requirements: statNode.$.requirements || ''
                            })
                          }
                        })
                      }
                      if (rulesNode.grant) {
                        rulesNode.grant.forEach((grantNode: any) => {
                          if (grantNode.$) {
                            rulesList.push({
                              type: 'grant',
                              grantType: grantNode.$.type,
                              id: grantNode.$.id,
                              requirements: grantNode.$.requirements || ''
                            })
                          }
                        })
                      }
                      if (rulesNode.select) {
                        rulesNode.select.forEach((selectNode: any) => {
                          if (selectNode.$) {
                            rulesList.push({
                              type: 'select',
                              selectType: selectNode.$.type,
                              name: selectNode.$.name,
                              number: selectNode.$.number || '1',
                              supports: selectNode.$.supports || '',
                              requirements: selectNode.$.requirements || '',
                              optional: selectNode.$.optional || ''
                            })
                          }
                        })
                      }
                    }

                    let supportsText = ''
                    if (element.supports) {
                      supportsText = IPCs.extractText(element.supports[0])
                    }

                    const elementObject = {
                      name: element.$.name,
                      type: element.$.type,
                      source: element.$.source,
                      id: element.$.id || '',
                      description: descriptionText,
                      htmlDescription: IPCs.extractRawDescription(xml, element.$.id || ''),
                      setters: settersObj,
                      rules: rulesList,
                      supports: supportsText
                    }

                    parsedElements.push(elementObject)
                  }
                })
              }
            }
          } catch (e) {
            console.error(`Error processing file ${filePath}:`, e)
          }
        })
        await Promise.all(tasks)
      } catch (e) {
        console.error(`Error scanning folder ${folderPath}:`, e)
      }
    }

    try {
      await searchForElements(customFolder)
    } catch (e) {
      console.error(e)
    }

    this.cachedElements = parsedElements
    return parsedElements
  }

  static initialize(): void {
    // Download pdf-lib if missing
    const pdfLibPath = path.join(__dirname, 'pdf-lib.js')
    const srcPdfLib = path.join(process.cwd(), 'src/main/pdf-lib.js')
    if (!fs.existsSync(pdfLibPath)) {
      if (fs.existsSync(srcPdfLib)) {
        fs.copyFileSync(srcPdfLib, pdfLibPath)
      } else {
        axios
          .get('https://unpkg.com/pdf-lib/dist/pdf-lib.min.js', { responseType: 'text' })
          .then((response) => {
            fs.writeFileSync(pdfLibPath, response.data, 'utf8')
          })
          .catch((err) => {
            console.error('Failed to download pdf-lib.js', err)
          })
      }
    }

    // List PDF fields immediately if pdf-lib exists and pdf_fields.txt doesn't
    const fieldsTextPath = path.join(process.cwd(), 'pdf_fields.txt')
    if (fs.existsSync(pdfLibPath) && !fs.existsSync(fieldsTextPath)) {
      try {
        const pdfPath = path.join(
          process.cwd(),
          'buildAssets/Sheets/5E_CharacterSheet_Fillable.pdf'
        )
        if (fs.existsSync(pdfPath)) {
          const pdfBytes = fs.readFileSync(pdfPath)
          const PDFLib = require(pdfLibPath)
          PDFLib.PDFDocument.load(pdfBytes)
            .then((pdfDoc: any) => {
              const form = pdfDoc.getForm()
              const fields = form.getFields()
              const fieldNames = fields.map((f: any) => `${f.constructor.name}: ${f.getName()}`)
              fs.writeFileSync(fieldsTextPath, fieldNames.join('\n'), 'utf8')
            })
            .catch((e: any) => {
              console.error('Failed to load PDF doc', e)
            })
        }
      } catch (e) {
        console.error('Error writing pdf fields file on initialize:', e)
      }
    }

    ipcMain.handle('msgGetAllElements', async (event: IpcMainEvent) => {
      return IPCs.loadElements()
    })

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
      let filePath = data.filePath

      // Determine save file path if not already provided or if it doesn't exist
      if (!filePath || !fs.existsSync(filePath)) {
        const defaultFolder = Constants.RAVEN_FOLDER
        if (!fs.existsSync(defaultFolder)) {
          fs.mkdirSync(defaultFolder, { recursive: true })
        }
        // Save to default folder as a .dnd5e file
        const fileName = `${data.characterName}.dnd5e`
        filePath = path.join(defaultFolder, fileName)
      }

      // Create the XML file content
      const xmlContent = IPCs.getCharacterXmlContent(data)

      fs.writeFileSync(filePath, xmlContent, 'utf8')
      console.log(`Character file saved to ${filePath}`)
      return { success: true, filePath }
    })

    // Get characters saved
    ipcMain.handle('msgGetCharacters', async (event: IpcMainEvent) => {
      // Ensure pdf-lib is downloaded
      const pdfLibPath = path.join(process.cwd(), 'src/main/pdf-lib.js')
      if (!fs.existsSync(pdfLibPath)) {
        try {
          const res = await axios.get('https://unpkg.com/pdf-lib/dist/pdf-lib.min.js', {
            responseType: 'text'
          })
          fs.writeFileSync(pdfLibPath, res.data, 'utf8')
        } catch (e) {
          console.error(e)
        }
      }

      // List PDF fields if pdf-lib exists and pdf_fields.txt doesn't
      const fieldsTextPath = path.join(process.cwd(), 'pdf_fields.txt')
      if (fs.existsSync(pdfLibPath) && !fs.existsSync(fieldsTextPath)) {
        try {
          const pdfPath = path.join(
            process.cwd(),
            'buildAssets/Sheets/5E_CharacterSheet_Fillable.pdf'
          )
          if (fs.existsSync(pdfPath)) {
            const pdfBytes = fs.readFileSync(pdfPath)
            const PDFLib = require('./pdf-lib.js')
            const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes)
            const form = pdfDoc.getForm()
            const fields = form.getFields()
            const fieldNames = fields.map((f: any) => `${f.constructor.name}: ${f.getName()}`)
            fs.writeFileSync(fieldsTextPath, fieldNames.join('\n'), 'utf8')
          }
        } catch (e) {
          console.error('Error writing pdf fields file:', e)
        }
      }

      const folders = [path.join(process.cwd(), 'GameCharacters'), Constants.RAVEN_FOLDER]
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
                    const displayProps = char['display-properties']
                      ? char['display-properties'][0]
                      : {}
                    const infoProps = char.information ? char.information[0] : {}

                    let avatar = ''
                    if (
                      displayProps.portrait &&
                      displayProps.portrait[0] &&
                      displayProps.portrait[0].base64
                    ) {
                      const b64 = displayProps.portrait[0].base64[0]
                      if (b64 && typeof b64 === 'string' && b64.trim()) {
                        avatar = `data:image/jpeg;base64,${b64.trim()}`
                      }
                    }
                    if (!avatar && displayProps.avatar) {
                      avatar = displayProps.avatar[0]
                    }

                    const stats = char.stats
                      ? char.stats[0]
                      : char.build && char.build[0].stats
                        ? char.build[0].stats[0]
                        : {}
                    const abilitiesProps = char.abilities
                      ? char.abilities[0]
                      : char.build && char.build[0].abilities
                        ? char.build[0].abilities[0]
                        : {}
                    const skillsGroup = char['proficient-skills']
                      ? char['proficient-skills'][0]
                      : {}
                    const savesGroup = char['proficient-saving-throws']
                      ? char['proficient-saving-throws'][0]
                      : {}

                    const proficientSkills: string[] = []
                    if (skillsGroup && skillsGroup.skill) {
                      if (Array.isArray(skillsGroup.skill)) {
                        skillsGroup.skill.forEach((s: any) => {
                          if (s) proficientSkills.push(String(s).trim())
                        })
                      } else {
                        proficientSkills.push(String(skillsGroup.skill).trim())
                      }
                    }

                    const proficientSavingThrows: string[] = []
                    if (savesGroup && savesGroup['saving-throw']) {
                      if (Array.isArray(savesGroup['saving-throw'])) {
                        savesGroup['saving-throw'].forEach((s: any) => {
                          if (s) proficientSavingThrows.push(String(s).trim())
                        })
                      } else {
                        proficientSavingThrows.push(String(savesGroup['saving-throw']).trim())
                      }
                    }

                    const characterObject = {
                      name: displayProps.name ? displayProps.name[0] : 'Unnamed',
                      avatar: avatar || '/images/icon-64px.png',
                      level: displayProps.level ? parseInt(displayProps.level[0], 10) : 1,
                      race: displayProps.race ? displayProps.race[0] : '',
                      subrace: displayProps.subrace ? displayProps.subrace[0] : '',
                      class: displayProps.class ? displayProps.class[0] : '',
                      group: infoProps.group ? infoProps.group[0] : 'Characters',
                      alignment: displayProps.alignment ? displayProps.alignment[0] : '',
                      background: {
                        name: displayProps.background ? displayProps.background[0] : '',
                        description: '',
                        id: '',
                        source: ''
                      },
                      backgroundVariant: displayProps['background-variant']
                        ? displayProps['background-variant'][0]
                        : '',
                      backgroundFeature: displayProps['background-feature']
                        ? displayProps['background-feature'][0]
                        : '',
                      archetype: displayProps.archetype ? displayProps.archetype[0] : '',
                      pronouns: displayProps.gender
                        ? displayProps.gender[0]
                        : char.build && char.build[0].input && char.build[0].input[0].gender
                          ? char.build[0].input[0].gender[0]
                          : 'Male',
                      playerName:
                        char.build && char.build[0].input && char.build[0].input[0]['player-name']
                          ? char.build[0].input[0]['player-name'][0]
                          : '',
                      experience:
                        char.build && char.build[0].input && char.build[0].input[0].experience
                          ? parseInt(char.build[0].input[0].experience[0], 10)
                          : 0,
                      abilityGenerationOption: infoProps.generationOption
                        ? infoProps.generationOption[0]
                        : 'Roll 4d6 - Discard Lowest',
                      languages: [],
                      feat: '',
                      proficiency: '',
                      spells: [],
                      inventory: [],
                      equipment: [],
                      str: stats.str
                        ? parseInt(stats.str[0], 10)
                        : abilitiesProps.strength
                          ? parseInt(abilitiesProps.strength[0], 10)
                          : 10,
                      dex: stats.dex
                        ? parseInt(stats.dex[0], 10)
                        : abilitiesProps.dexterity
                          ? parseInt(abilitiesProps.dexterity[0], 10)
                          : 10,
                      con: stats.con
                        ? parseInt(stats.con[0], 10)
                        : abilitiesProps.constitution
                          ? parseInt(abilitiesProps.constitution[0], 10)
                          : 10,
                      int: stats.int
                        ? parseInt(stats.int[0], 10)
                        : abilitiesProps.intelligence
                          ? parseInt(abilitiesProps.intelligence[0], 10)
                          : 10,
                      wis: stats.wis
                        ? parseInt(stats.wis[0], 10)
                        : abilitiesProps.wisdom
                          ? parseInt(abilitiesProps.wisdom[0], 10)
                          : 10,
                      cha: stats.cha
                        ? parseInt(stats.cha[0], 10)
                        : abilitiesProps.charisma
                          ? parseInt(abilitiesProps.charisma[0], 10)
                          : 10,
                      hp: stats.hp ? parseInt(stats.hp[0], 10) : 10,
                      speed: stats.speed ? parseInt(stats.speed[0], 10) : 30,
                      proficientSkills,
                      proficientSavingThrows,
                      filePath
                    }

                    // Debug parsed XML structure
                    if (displayProps.name && String(displayProps.name[0]).includes('Flower Pot')) {
                      fs.writeFileSync(
                        'C:\\Users\\Jacquelinne\\Documents\\Raven Character Builder\\debug_ipcs.txt',
                        JSON.stringify(characterObject, null, 2),
                        'utf8'
                      )
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

    const sendUpdateStatus = (data: {
      status: 'checking' | 'updating' | 'up-to-date' | 'updated' | 'offline' | 'error'
      indexName?: string
      version?: string
      error?: string
    }) => {
      BrowserWindow.getAllWindows().forEach((win) => {
        if (!win.isDestroyed()) {
          win.webContents.send('msgUpdateStatus', data)
        }
      })
    }

    const isHigherVersion = (remote: string, local: string): boolean => {
      const remoteParts = remote.split('.').map(Number)
      const localParts = local.split('.').map(Number)
      for (let i = 0; i < Math.max(remoteParts.length, localParts.length); i++) {
        const r = remoteParts[i] || 0
        const l = localParts[i] || 0
        if (r > l) return true
        if (r < l) return false
      }
      return false
    }

    const downloadIndexRecursive = async (
      url: string,
      targetDir: string,
      indexName: string
    ): Promise<void> => {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true })
      }
      const indexFilePath = path.join(targetDir, `${indexName}.index`)

      // Download index content as text to prevent automatic parsing issues
      const response = await axios.get(url, { timeout: 10000, responseType: 'text' })
      const indexFileContent =
        typeof response.data === 'string' ? response.data : JSON.stringify(response.data)

      fs.writeFileSync(indexFilePath, indexFileContent, 'utf8')

      // Parse XML content
      const parser = new xml2js.Parser()
      const result = await new Promise<any>((resolve, reject) => {
        parser.parseString(indexFileContent, (err, res) => {
          if (err) reject(err)
          else resolve(res)
        })
      })

      // If there are files listed, download them into a subfolder with indexName
      if (result?.index?.files?.[0]?.file) {
        const files = result.index.files[0].file
        const subFolder = path.join(targetDir, indexName)
        if (!fs.existsSync(subFolder)) {
          fs.mkdirSync(subFolder, { recursive: true })
        }

        for (const file of files) {
          const fileName = file.$.name
          const fileUrl = file.$.url

          if (fileName.endsWith('.index')) {
            const nameWithoutExt = path.basename(fileName, '.index')
            await downloadIndexRecursive(fileUrl, subFolder, nameWithoutExt)
          } else {
            const fileResponse = await axios.get(fileUrl, { timeout: 10000, responseType: 'text' })
            const fileContent =
              typeof fileResponse.data === 'string'
                ? fileResponse.data
                : JSON.stringify(fileResponse.data)
            const destPath = path.join(subFolder, fileName)
            fs.writeFileSync(destPath, fileContent, 'utf8')
          }
        }
      }
    }

    // Index Downloader
    ipcMain.handle('msgDownloadIndex', async (event: IpcMainEvent, url: string) => {
      IPCs.cachedElements = null
      const ravenCMFolder = Constants.RAVEN_FOLDER
      const customFolder = Constants.CUSTOM_FOLDER

      if (!fs.existsSync(ravenCMFolder)) {
        fs.mkdirSync(ravenCMFolder, { recursive: true })
      }
      if (!fs.existsSync(customFolder)) {
        fs.mkdirSync(customFolder, { recursive: true })
      }

      try {
        const parsedUrl = new URL(url)
        const indexFileName = path.basename(parsedUrl.pathname)
        const indexName = path.basename(parsedUrl.pathname, '.index')
        const localPath = path.join(customFolder, indexFileName)
        const relatedFolder = path.join(customFolder, indexName)
        const folderExists = fs.existsSync(relatedFolder)

        let shouldDownload = true
        let remoteVersion = '0.0.0'

        // Fetch remote index content first to check its version
        let remoteContent: string
        try {
          const remoteRes = await axios.get(url, { timeout: 10000, responseType: 'text' })
          remoteContent = remoteRes.data
        } catch (e) {
          console.error(`Offline or unable to reach URL for upload:`, e)
          return { status: 'offline' }
        }

        const parser = new xml2js.Parser()
        const remoteResult = await new Promise<any>((resolve, reject) => {
          parser.parseString(remoteContent, (err, res) => {
            if (err) reject(err)
            else resolve(res)
          })
        })
        remoteVersion = remoteResult?.index?.info?.[0]?.update?.[0]?.$?.version || '0.0.0'

        if (fs.existsSync(localPath)) {
          const localContent = fs.readFileSync(localPath, 'utf8')
          const localResult = await new Promise<any>((resolve, reject) => {
            parser.parseString(localContent, (err, res) => {
              if (err) reject(err)
              else resolve(res)
            })
          })
          const localVersion = localResult?.index?.info?.[0]?.update?.[0]?.$?.version || '0.0.0'

          if (!isHigherVersion(remoteVersion, localVersion) && folderExists) {
            shouldDownload = false
          }
        }

        if (shouldDownload) {
          await downloadIndexRecursive(url, customFolder, indexName)
          return { status: 'updated', version: remoteVersion }
        } else {
          return { status: 'up-to-date', version: remoteVersion }
        }
      } catch (e) {
        console.error('Error downloading index:', e)
        return { status: 'error', error: String(e) }
      }
    })

    // Boot Update Checker
    ipcMain.handle('msgTriggerUpdateCheck', async (event: IpcMainEvent) => {
      const customFolder = Constants.CUSTOM_FOLDER
      if (!fs.existsSync(customFolder)) {
        fs.mkdirSync(customFolder, { recursive: true })
      }

      const files = fs.readdirSync(customFolder)
      const indexFiles = files.filter((f) => f.endsWith('.index'))

      if (indexFiles.length === 0) {
        sendUpdateStatus({ status: 'up-to-date' })
        return
      }

      for (const indexFile of indexFiles) {
        const indexName = path.basename(indexFile, '.index')
        const localPath = path.join(customFolder, indexFile)

        try {
          const localContent = fs.readFileSync(localPath, 'utf8')
          const parser = new xml2js.Parser()
          const localResult = await new Promise<any>((resolve, reject) => {
            parser.parseString(localContent, (err, res) => {
              if (err) reject(err)
              else resolve(res)
            })
          })

          const localVersion = localResult?.index?.info?.[0]?.update?.[0]?.$?.version || '0.0.0'
          const updateUrl = localResult?.index?.info?.[0]?.update?.[0]?.file?.[0]?.$?.url

          if (!updateUrl) {
            console.log(`No update URL found for ${indexFile}`)
            continue
          }

          sendUpdateStatus({ status: 'checking', indexName })

          let remoteContent: string
          try {
            const remoteRes = await axios.get(updateUrl, { timeout: 10000, responseType: 'text' })
            remoteContent = remoteRes.data
          } catch (e) {
            console.error(`Offline or unable to reach update URL for ${indexName}:`, e)
            sendUpdateStatus({ status: 'offline', indexName })
            return // Stop trying to update
          }

          const remoteResult = await new Promise<any>((resolve, reject) => {
            parser.parseString(remoteContent, (err, res) => {
              if (err) reject(err)
              else resolve(res)
            })
          })

          const remoteVersion = remoteResult?.index?.info?.[0]?.update?.[0]?.$?.version || '0.0.0'
          const relatedFolder = path.join(customFolder, indexName)
          const folderExists = fs.existsSync(relatedFolder)

          if (isHigherVersion(remoteVersion, localVersion) || !folderExists) {
            sendUpdateStatus({ status: 'updating', indexName, version: remoteVersion })
            await downloadIndexRecursive(updateUrl, customFolder, indexName)
            sendUpdateStatus({ status: 'updated', indexName, version: remoteVersion })
          } else {
            sendUpdateStatus({ status: 'up-to-date', indexName })
          }
        } catch (e) {
          console.error(`Error checking update for ${indexFile}:`, e)
          sendUpdateStatus({ status: 'error', indexName, error: String(e) })
          return // Stop trying to update
        }
      }
    })

    ipcMain.handle('msgOpenContentFolder', async (event: IpcMainEvent) => {
      const customFolder = Constants.CUSTOM_FOLDER
      if (!fs.existsSync(customFolder)) {
        fs.mkdirSync(customFolder, { recursive: true })
      }
      shell.openPath(customFolder)
    })

    ipcMain.handle('msgOpenUserFolder', async (event: IpcMainEvent) => {
      const userFolder = path.join(Constants.CUSTOM_FOLDER, 'user')
      if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true })
      }
      shell.openPath(userFolder)
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
            const mimeType =
              ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : `image/${ext.substring(1)}`
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

    // Window controls
    ipcMain.on('msgMinimizeWindow', (event: IpcMainEvent) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      if (win) win.minimize()
    })

    ipcMain.on('msgMaximizeWindow', (event: IpcMainEvent) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      if (win) {
        if (win.isMaximized()) {
          win.unmaximize()
        } else {
          win.maximize()
        }
      }
    })

    ipcMain.on('msgCloseWindow', (event: IpcMainEvent) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      if (win) win.close()
    })

    // Show native confirm dialog
    ipcMain.handle('msgShowConfirmDialog', async (event: IpcMainEvent, options: any) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      const result = await dialog.showMessageBox(win!, {
        type: 'question',
        buttons: options.buttons || ['Yes', 'No'],
        defaultId: 0,
        cancelId: 2,
        title: options.title || 'Confirmation',
        message: options.message || 'Are you sure?'
      })
      return result.response
    })

    // Update character's group
    ipcMain.handle(
      'msgUpdateCharacterGroup',
      async (event: IpcMainEvent, filePath: string, newGroup: string) => {
        if (!filePath || !fs.existsSync(filePath)) {
          return { success: false, error: 'File not found' }
        }
        try {
          let content = fs.readFileSync(filePath, 'utf8')
          // Simple regex replace for <group>...</group>
          if (/<group>([\s\S]*?)<\/group>/.test(content)) {
            content = content.replace(/<group>([\s\S]*?)<\/group>/, `<group>${newGroup}</group>`)
          } else {
            // If group doesn't exist, try to insert it inside <information>
            if (/<information>([\s\S]*?)<\/information>/.test(content)) {
              content = content.replace(
                /<information>([\s\S]*?)<\/information>/,
                `<information>\n\t\t<group>${newGroup}</group>$1</information>`
              )
            } else {
              // Otherwise, insert it right after the root tag
              content = content.replace(
                /<character([^>]*?)>/,
                `<character$1>\n\t<information>\n\t\t<group>${newGroup}</group>\n\t</information>`
              )
            }
          }
          fs.writeFileSync(filePath, content, 'utf8')
          return { success: true }
        } catch (err: any) {
          console.error('Error updating character group', err)
          return { success: false, error: err.message }
        }
      }
    )

    // Delete character file
    ipcMain.handle('msgDeleteCharacter', async (event: IpcMainEvent, filePath: string) => {
      if (!filePath || !fs.existsSync(filePath)) {
        return { success: false, error: 'File not found' }
      }
      try {
        fs.unlinkSync(filePath)
        return { success: true }
      } catch (err: any) {
        console.error('Error deleting character file', err)
        return { success: false, error: err.message }
      }
    })

    // Generate PDF character sheet preview
    ipcMain.handle(
      'msgGeneratePreview',
      async (event: IpcMainEvent, filePathOrData: string | any, armorClassOverride?: string) => {
        let tempFilePathToDelete: string | null = null
        try {
          let filePath = ''
          if (typeof filePathOrData === 'string') {
            filePath = filePathOrData
          } else if (filePathOrData && typeof filePathOrData === 'object') {
            const tempFolder = app.getPath('temp')
            filePath = path.join(
              tempFolder,
              `raven_preview_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.dnd5e`
            )
            const xmlContent = IPCs.getCharacterXmlContent(filePathOrData)
            fs.writeFileSync(filePath, xmlContent, 'utf8')
            tempFilePathToDelete = filePath
          }

          if (!filePath || !fs.existsSync(filePath)) {
            return { success: false, error: 'Character file not found' }
          }

          const xmlContent = fs.readFileSync(filePath, 'utf8')
          const parser = new xml2js.Parser()
          const parsed = await parser.parseStringPromise(xmlContent)
          if (!parsed || !parsed.character) {
            return { success: false, error: 'Invalid character XML' }
          }

          const char = parsed.character
          const displayProps = char['display-properties'] ? char['display-properties'][0] : {}
          const infoProps = char.information ? char.information[0] : {}
          const abilitiesProps = char.abilities ? char.abilities[0] : {}
          const appearanceProps = char.appearance ? char.appearance[0] : {}

          // Gather all elements registered in the character's sum or elements list
          const elementIds = new Set<string>()
          if (char.elements && char.elements[0] && char.elements[0].element) {
            const elements = char.elements[0].element
            elements.forEach((el: any) => {
              if (el.$ && el.$.id) elementIds.add(el.$.id.toUpperCase())
              if (el.$ && el.$.registered) elementIds.add(el.$.registered.toUpperCase())
            })
          }
          if (
            char.build &&
            char.build[0] &&
            char.build[0].sum &&
            char.build[0].sum[0] &&
            char.build[0].sum[0].element
          ) {
            const elements = char.build[0].sum[0].element
            elements.forEach((el: any) => {
              if (el.$ && el.$.id) elementIds.add(el.$.id.toUpperCase())
              if (el.$ && el.$.registered) elementIds.add(el.$.registered.toUpperCase())
            })
          }

          // Get abilities base
          const statsProps = char.stats ? char.stats[0] : {}
          let str = statsProps.str
            ? parseInt(statsProps.str[0], 10)
            : abilitiesProps.strength
              ? parseInt(abilitiesProps.strength[0], 10)
              : 10
          let dex = statsProps.dex
            ? parseInt(statsProps.dex[0], 10)
            : abilitiesProps.dexterity
              ? parseInt(abilitiesProps.dexterity[0], 10)
              : 10
          let con = statsProps.con
            ? parseInt(statsProps.con[0], 10)
            : abilitiesProps.constitution
              ? parseInt(abilitiesProps.constitution[0], 10)
              : 10
          let int = statsProps.int
            ? parseInt(statsProps.int[0], 10)
            : abilitiesProps.intelligence
              ? parseInt(abilitiesProps.intelligence[0], 10)
              : 10
          let wis = statsProps.wis
            ? parseInt(statsProps.wis[0], 10)
            : abilitiesProps.wisdom
              ? parseInt(abilitiesProps.wisdom[0], 10)
              : 10
          let cha = statsProps.cha
            ? parseInt(statsProps.cha[0], 10)
            : abilitiesProps.charisma
              ? parseInt(abilitiesProps.charisma[0], 10)
              : 10

          // Apply race and subrace modifiers dynamically from parsed rules in XML compendiums
          const applyStatRulesForName = (elementName: string, elementTypes: string[]) => {
            if (!elementName) return
            const nameLower = elementName.toLowerCase()
            const foundElements = IPCs.cachedElements?.filter(
              (el) => elementTypes.includes(el.type) && el.name.toLowerCase() === nameLower
            )

            if (foundElements) {
              foundElements.forEach((el) => {
                if (el.rules) {
                  el.rules.forEach((rule: any) => {
                    if (rule.type === 'stat') {
                      const statName = rule.name.toLowerCase()
                      const val = parseInt(rule.value, 10) || 0

                      // Skip TCoE customized ASI rules (which require choices) since we are processing the standard stat boosts
                      if (
                        rule.requirements &&
                        rule.requirements.includes('CUSTOMIZED_ASI') &&
                        !rule.requirements.startsWith('!')
                      ) {
                        return
                      }

                      if (statName === 'strength') str += val
                      else if (statName === 'dexterity') dex += val
                      else if (statName === 'constitution') con += val
                      else if (statName === 'intelligence') int += val
                      else if (statName === 'wisdom') wis += val
                      else if (statName === 'charisma') cha += val
                    }
                  })
                }
              })
            }
          }

          // Apply stats for the base race
          if (displayProps.race && displayProps.race[0]) {
            applyStatRulesForName(displayProps.race[0], ['Race', 'Race Variant'])
          }

          // Apply stats for the selected subrace
          if (displayProps.subrace && displayProps.subrace[0]) {
            applyStatRulesForName(displayProps.subrace[0], ['Sub Race', 'Race Variant'])
          }

          // Apply ASI improvements
          elementIds.forEach((id) => {
            if (id.includes('ASI_STRENGTH')) str += 1
            if (id.includes('ASI_DEXTERITY')) dex += 1
            if (id.includes('ASI_CONSTITUTION')) con += 1
            if (id.includes('ASI_INTELLIGENCE')) int += 1
            if (id.includes('ASI_WISDOM')) wis += 1
            if (id.includes('ASI_CHARISMA')) cha += 1
          })

          // Modifiers
          const getMod = (val: number) => Math.floor((val - 10) / 2)
          const formatMod = (val: number) => {
            const mod = getMod(val)
            return mod >= 0 ? `+${mod}` : `${mod}`
          }

          const strModVal = getMod(str)
          const dexModVal = getMod(dex)
          const conModVal = getMod(con)
          const intModVal = getMod(int)
          const wisModVal = getMod(wis)
          const chaModVal = getMod(cha)

          const level = displayProps.level ? parseInt(displayProps.level[0], 10) : 1
          const profBonus = Math.floor((level - 1) / 4) + 2

          // Parse proficient skills and saving throws from XML
          const skillsGroup = char['proficient-skills'] ? char['proficient-skills'][0] : {}
          const savesGroup = char['proficient-saving-throws']
            ? char['proficient-saving-throws'][0]
            : {}

          const proficientSkills: string[] = []
          if (skillsGroup && skillsGroup.skill) {
            if (Array.isArray(skillsGroup.skill)) {
              skillsGroup.skill.forEach((s: any) => {
                if (s) proficientSkills.push(String(s).trim().toLowerCase())
              })
            } else {
              proficientSkills.push(String(skillsGroup.skill).trim().toLowerCase())
            }
          }

          const proficientSavingThrows: string[] = []
          if (savesGroup && savesGroup['saving-throw']) {
            if (Array.isArray(savesGroup['saving-throw'])) {
              savesGroup['saving-throw'].forEach((s: any) => {
                if (s) proficientSavingThrows.push(String(s).trim().toLowerCase())
              })
            } else {
              proficientSavingThrows.push(String(savesGroup['saving-throw']).trim().toLowerCase())
            }
          }

          // Helper to check if proficient in skill or saving throw
          const hasProf = (key: string, isSavingThrow: boolean = false) => {
            const keyLower = key.toLowerCase()
            if (isSavingThrow) {
              return (
                proficientSavingThrows.includes(keyLower) ||
                elementIds.has(`ID_PROFICIENCY_SAVINGTHROW_${key.toUpperCase()}`)
              )
            } else {
              const keySearch = keyLower.replace(/_/g, ' ')
              return (
                proficientSkills.includes(keySearch) ||
                elementIds.has(`ID_PROFICIENCY_SKILL_${key.toUpperCase()}`)
              )
            }
          }

          const calcST = (key: string, modVal: number) => {
            const proficient = hasProf(key, true)
            const total = modVal + (proficient ? profBonus : 0)
            return { value: total >= 0 ? `+${total}` : `${total}`, proficient }
          }

          const calcSkill = (key: string, modVal: number) => {
            const proficient = hasProf(key, false)
            const total = modVal + (proficient ? profBonus : 0)
            return { value: total >= 0 ? `+${total}` : `${total}`, proficient }
          }

          // Open template PDF
          const pdfTemplatePath = path.join(
            process.cwd(),
            'buildAssets/Sheets/5E_CharacterSheet_Fillable.pdf'
          )
          if (!fs.existsSync(pdfTemplatePath)) {
            return { success: false, error: 'PDF template not found' }
          }

          const pdfBytes = fs.readFileSync(pdfTemplatePath)
          const pdfLibPath = path.join(__dirname, 'pdf-lib.js')
          const PDFLib = require(pdfLibPath)
          const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes)
          const form = pdfDoc.getForm()

          // Set Text Fields
          const setField = (name: string, val: string) => {
            try {
              const field = form.getTextField(name)
              if (field) field.setText(val)
            } catch (e) {
              console.error(`Failed to set text field ${name}:`, e)
            }
          }

          const setCheck = (name: string, check: boolean) => {
            try {
              const field = form.getCheckBox(name)
              if (field) {
                if (check) field.check()
                else field.uncheck()
              }
            } catch (e) {
              console.error(`Failed to set check box ${name}:`, e)
            }
          }

          // Base Info
          setField('CharacterName', displayProps.name ? displayProps.name[0] : '')
          setField('CharacterName 2', displayProps.name ? displayProps.name[0] : '')
          setField(
            'ClassLevel',
            `Level ${level} ${displayProps.class ? displayProps.class[0] : ''}`
          )
          setField('Background', displayProps.background ? displayProps.background[0] : '')
          setField(
            'PlayerName',
            char.build && char.build[0].input && char.build[0].input[0]['player-name']
              ? char.build[0].input[0]['player-name'][0]
              : ''
          )
          setField('Race ', displayProps.race ? displayProps.race[0] : '')
          setField('Alignment', displayProps.alignment ? displayProps.alignment[0] : '')
          setField(
            'XP',
            char.build && char.build[0].input && char.build[0].input[0].experience
              ? char.build[0].input[0].experience[0]
              : '0'
          )

          // Ability Scores
          setField('STR', String(str))
          setField('DEX', String(dex))
          setField('CON', String(con))
          setField('INT', String(int))
          setField('WIS', String(wis))
          setField('CHA', String(cha))

          setField('STRmod', formatMod(str))
          setField('DEXmod ', formatMod(dex))
          setField('CONmod', formatMod(con))
          setField('INTmod', formatMod(int))
          setField('WISmod', formatMod(wis))
          setField('CHamod', formatMod(cha))

          // Saving Throws
          const stStr = calcST('strength', strModVal)
          const stDex = calcST('dexterity', dexModVal)
          const stCon = calcST('constitution', conModVal)
          const stInt = calcST('intelligence', intModVal)
          const stWis = calcST('wisdom', wisModVal)
          const stCha = calcST('charisma', chaModVal)

          setField('ST Strength', stStr.value)
          setField('ST Dexterity', stDex.value)
          setField('ST Constitution', stCon.value)
          setField('ST Intelligence', stInt.value)
          setField('ST Wisdom', stWis.value)
          setField('ST Charisma', stCha.value)

          setCheck('Check Box 11', stStr.proficient)
          setCheck('Check Box 18', stDex.proficient)
          setCheck('Check Box 19', stCon.proficient)
          setCheck('Check Box 20', stInt.proficient)
          setCheck('Check Box 21', stWis.proficient)
          setCheck('Check Box 22', stCha.proficient)

          // Skills (alphabetical check boxes 23-40)
          const skillsList = [
            { name: 'acrobatics', mod: dexModVal, box: 'Check Box 23', field: 'Acrobatics' },
            { name: 'animal_handling', mod: wisModVal, box: 'Check Box 24', field: 'Animal' },
            { name: 'arcana', mod: intModVal, box: 'Check Box 25', field: 'Arcana' },
            { name: 'athletics', mod: strModVal, box: 'Check Box 26', field: 'Athletics' },
            { name: 'deception', mod: chaModVal, box: 'Check Box 27', field: 'Deception ' },
            { name: 'history', mod: intModVal, box: 'Check Box 28', field: 'History ' },
            { name: 'insight', mod: wisModVal, box: 'Check Box 29', field: 'Insight' },
            { name: 'intimidation', mod: chaModVal, box: 'Check Box 30', field: 'Intimidation' },
            { name: 'investigation', mod: intModVal, box: 'Check Box 31', field: 'Investigation ' },
            { name: 'medicine', mod: wisModVal, box: 'Check Box 32', field: 'Medicine' },
            { name: 'nature', mod: intModVal, box: 'Check Box 33', field: 'Nature' },
            { name: 'perception', mod: wisModVal, box: 'Check Box 34', field: 'Perception ' },
            { name: 'performance', mod: chaModVal, box: 'Check Box 35', field: 'Performance' },
            { name: 'persuasion', mod: chaModVal, box: 'Check Box 36', field: 'Persuasion' },
            { name: 'religion', mod: intModVal, box: 'Check Box 37', field: 'Religion' },
            {
              name: 'sleight_of_hand',
              mod: dexModVal,
              box: 'Check Box 38',
              field: 'SleightofHand'
            },
            { name: 'stealth', mod: dexModVal, box: 'Check Box 39', field: 'Stealth ' },
            { name: 'survival', mod: wisModVal, box: 'Check Box 40', field: 'Survival' }
          ]

          skillsList.forEach((skill) => {
            const s = calcSkill(skill.name, skill.mod)
            setField(skill.field, s.value)
            setCheck(skill.box, s.proficient)
          })

          // Proficiency Bonus, AC, Speed, Initiative, Passive Wisdom
          setField('ProfBonus', `+${profBonus}`)
          const baseAc = 10 + dexModVal
          const raceStr = displayProps.race ? displayProps.race[0].toLowerCase() : ''
          const isWarforged = raceStr.includes('warforged')
          const racialAcBonus = isWarforged ? 1 : 0
          const computedAc = String(baseAc + racialAcBonus)
          const acVal =
            armorClassOverride && armorClassOverride.trim() ? armorClassOverride : computedAc

          setField('AC', acVal)
          setField('Initiative', formatMod(dex))

          const speedVal = statsProps.speed ? statsProps.speed[0] : '30'
          setField('Speed', `${speedVal}ft.`)

          const hpVal = statsProps.hp ? statsProps.hp[0] : '10'
          setField('HPMax', String(hpVal))
          setField('HPCurrent', String(hpVal))

          const perceptionVal = calcSkill('perception', wisModVal)
          const passiveWisdom = 10 + (parseInt(perceptionVal.value.replace('+', ''), 10) || 0)
          setField('Passive', String(passiveWisdom))

          // Appearance
          setField('Age', appearanceProps.age ? appearanceProps.age[0] : '')
          setField('Height', appearanceProps.height ? appearanceProps.height[0] : '')
          setField('Weight', appearanceProps.weight ? appearanceProps.weight[0] : '')
          setField('Eyes', appearanceProps.eyes ? appearanceProps.eyes[0] : '')
          setField('Skin', appearanceProps.skin ? appearanceProps.skin[0] : '')
          setField('Hair', appearanceProps.hair ? appearanceProps.hair[0] : '')

          // Spellcasting block if present
          let spellClass = ''
          let spellAbility = ''
          let spellAttack = ''
          let spellDc = ''
          if (
            char.build &&
            char.build[0] &&
            char.build[0].magic &&
            char.build[0].magic[0] &&
            char.build[0].magic[0].spellcasting
          ) {
            const sc = char.build[0].magic[0].spellcasting[0]
            spellClass = sc.$.name || ''
            spellAbility = sc.$.ability || ''
            spellAttack = sc.$.attack ? `+${sc.$.attack}` : ''
            spellDc = sc.$.dc || ''
          }
          setField('Spellcasting Class 2', spellClass)
          setField('SpellcastingAbility 2', spellAbility)
          setField('SpellAtkBonus 2', spellAttack)
          setField('SpellSaveDC  2', spellDc)

          // Features & Traits summary
          let featuresList: string[] = []
          if (
            char.build &&
            char.build[0] &&
            char.build[0].elements &&
            char.build[0].elements[0] &&
            char.build[0].elements[0].element
          ) {
            const elements = char.build[0].elements[0].element
            elements.forEach((el: any) => {
              if (
                el.$ &&
                el.$.type &&
                ['Class Feature', 'Archetype Feature', 'Racial Trait'].includes(el.$.type)
              ) {
                const name = el.$.name
                featuresList.push(`${name}`)
              }
            })
          }
          setField('Features and Traits', featuresList.join('\n'))

          const pdfBytesFilled = await pdfDoc.save()
          const base64 = Buffer.from(pdfBytesFilled).toString('base64')
          return { success: true, base64 }
        } catch (err: any) {
          console.error('Error generating preview PDF', err)
          return { success: false, error: err.message }
        } finally {
          if (tempFilePathToDelete && fs.existsSync(tempFilePathToDelete)) {
            try {
              fs.unlinkSync(tempFilePathToDelete)
            } catch (unlinkErr) {
              console.error('Error deleting temporary preview file:', unlinkErr)
            }
          }
        }
      }
    )

    // Save filled character sheet PDF
    ipcMain.handle(
      'msgSavePdf',
      async (event: IpcMainEvent, base64: string, characterName: string) => {
        try {
          const win = BrowserWindow.fromWebContents(event.sender)
          const { filePath } = await dialog.showSaveDialog(win!, {
            title: 'Save Character Sheet PDF',
            defaultPath: `${characterName || 'Character'}_Sheet.pdf`,
            filters: [{ name: 'PDF File', extensions: ['pdf'] }]
          })
          if (filePath) {
            const buffer = Buffer.from(base64, 'base64')
            fs.writeFileSync(filePath, buffer)
            return { success: true, filePath }
          }
          return { success: false, error: 'Cancelled' }
        } catch (err: any) {
          console.error('Error saving PDF file', err)
          return { success: false, error: err.message }
        }
      }
    )

    // Get release notes from buildAssets/release.txt
    ipcMain.handle('msgGetReleaseNotes', async () => {
      try {
        const releasePath = path.join(process.cwd(), 'buildAssets/release.txt')
        if (fs.existsSync(releasePath)) {
          return fs.readFileSync(releasePath, 'utf8')
        }
        return 'No release notes available.'
      } catch (err) {
        console.error('Error reading release.txt', err)
        return 'No release notes available.'
      }
    })
  }
}
