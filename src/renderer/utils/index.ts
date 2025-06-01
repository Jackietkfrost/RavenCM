export default class Utils {
  static getCurrentLocale(): string {
    return navigator?.language?.split('-')[0] || 'en'
  }

  static async openExternal(url: string): Promise<void> {
    await window.mainApi.send('msgOpenExternalLink', url)
  }

  static async openFile(type: string): Promise<any> {
    return window.mainApi.invoke('msgOpenFile', type)
  }

  static async saveCharacter(data: any): Promise<any> {
    return window.mainApi.invoke('msgSaveCharacter', data)
  }

  static async getAllElements(data: any): Promise<any> {
    return window.mainApi.invoke('msgGetAllElements', data)
  }
}

export const { getCurrentLocale, openExternal, openFile, saveCharacter } = Utils
