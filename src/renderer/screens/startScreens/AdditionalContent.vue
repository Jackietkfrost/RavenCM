<template>
  <v-container>
    <h2>Extending the content</h2>
    <p>
      Raven Character Manager comes bundled with all the content that is included in the System
      Reference Document released under the Open Gaming License. To extend the content, you can
      build your own XML files and add them to the content folder, or use an index file.
    </p>
    <h2>Index Files</h2>
    <p>
      Index files allow the creator to update his or her files and allow Aurora to automatically
      download and update the content. When you've obtained the URL of the .index file; enter it in
      the field below and click 'Download' and then click 'Update Content Files'.
    </p>
    <v-text-field
      placeholder="https://"
      label="Remote Index File URL"
      density="compact"
      variant="outlined"
    >
      <template #append>
        <v-btn :prepend-icon="mdiFileDownload" small variant="flat">Upload</v-btn>
      </template>
    </v-text-field>
    <h2>UPDATE CONTENT FILES</h2>

    <p
      >Unless disabled, the application will check in the background for updated content shortly
      after starting up. After content has been updated a button will be available to restart the
      application so the updated content can be reloaded. When you are experiencing issues with the
      content you can click the 'Clear Downloaded Content' button to remove content files added
      through the index files. Then click 'Update Content Files' to download the latest files new..
      You should place your personal homebrew files in the specific 'custom\user' folder.</p
    >
    <v-btn :prepend-icon="mdiFolderDownload">Update Content Files</v-btn>
    <v-btn :prepend-icon="mdiFolderRemove">Clear Downloaded Content</v-btn>
    <v-btn :prepend-icon="mdiFolderOpen">Content Folder</v-btn>
    <v-btn :prepend-icon="mdiFolderAccount">User Content Folder</v-btn>
  </v-container>
</template>
<script setup lang="tsx">
import { mdiFileDownload, mdiFolderAccount, mdiFolderDownload, mdiFolderOpen, mdiFolderRemove } from '@mdi/js'
</script>
<style></style>
