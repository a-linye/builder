<template>
  <UIEditorSpriteItem :img-src="imgSrc" :img-loading="imgLoading" :name="sprite.name" :selected="selected">
    <CornerMenu :visible="selected" color="sprite" removable :item="sprite" @remove="handleRemove" />
  </UIEditorSpriteItem>
</template>

<script setup lang="ts">
import { UIEditorSpriteItem } from '@/components/ui'
import { useFileUrl } from '@/utils/file'
import { Sprite } from '@/models/sprite'
import { useMessageHandle } from '@/utils/exception'
import { useEditorCtx } from '../../EditorContextProvider.vue'
import CornerMenu from '../../common/CornerMenu.vue'

const props = defineProps<{
  sprite: Sprite
  selected: boolean
}>()

const editorCtx = useEditorCtx()

const [imgSrc, imgLoading] = useFileUrl(() => props.sprite.defaultCostume?.img)

const handleRemove = useMessageHandle(
  async () => {
    const spriteId = props.sprite.id
    const spriteName = props.sprite.name
    const action = { name: { en: `Remove sprite ${spriteName}`, zh: `删除精灵 ${spriteName}` } }
    await editorCtx.project.history.doAction(action, () => editorCtx.project.removeSprite(spriteId))
  },
  {
    en: 'Failed to remove sprite',
    zh: '删除精灵失败'
  }
).fn
</script>
