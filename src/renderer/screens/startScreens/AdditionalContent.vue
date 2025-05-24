<template>
  <h1>Extending the content</h1>
  <p>
    Raven Character Manager comes bundled with all content that is included in the System Reference
    Document released under the Open Gaming License. To extend the content, you can build your own
    XML files and add them to the content folder, or use an index file.
  </p>
  <h1>Index Files</h1>
  <p>
    Index files allow the creator to update his or her files and allow Aurora to automatically
    download and update the content. When you've obtained the URL of the .index file; enter it in the
    field below and click 'Download' and then click 'Update Content Files'.
  </p>
  <v-text-field
    placeholder="https://"
    append-icon="mdi-file-pdf"
    label="Remote Index File URL"
    density="compact"
    variant="outlined"
  >
    <template #append>
      <v-btn :prepend-icon="mdiFileDownload" small variant="flat">Upload</v-btn>
    </template>
  </v-text-field>
</template>
<script setup lang="tsx">
import { mdiFileDownload } from '@mdi/js'
</script>
<style></style>
