import { ipcMain, shell, IpcMainEvent, dialog } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
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
      if (filter === 'text') {
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
  }
}
