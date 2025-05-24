import { ipcMain, shell, IpcMainEvent, dialog } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import * as xml2js from 'xml2js'
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

    ipcMain.handle('msgGetCharacters', async (event: IpcMainEvent) => {
      const gameCharactersFolder = path.join(__dirname, 'GameCharacters')
      const files = await fs.readdirSync(gameCharactersFolder)
      const characters = []

      files.forEach((file) => {
        const filePath = path.join(gameCharactersFolder, file)
        const fileContent = fs.readFileSync(filePath, 'utf8')
        const parser = new xml2js.Parser()
        parser.parseString(fileContent, (err, result) => {
          if (err) {
            console.error(err)
          } else {
            const resultWithUnderscores = JSON.parse(JSON.stringify(result).replace(/-/g, '_'))
            characters.push(resultWithUnderscores)
          }
        })
      })

      return characters
    })
  }
}
