<template>
  <UIFormModal
    :title="$t({ en: 'Add to asset library', zh: '添加到素材库' })"
    :visible="visible"
    @update:visible="emit('cancelled')"
  >
    <UIForm :form="form" @submit="handleSubmit.fn">
      <main class="main">
        <div class="sider">
          <BackdropPreview v-if="asset instanceof Backdrop" class="preview" :backdrop="asset" />
          <SpritePreview v-if="asset instanceof Sprite" class="preview" :sprite="asset" />
          <SoundPreview v-if="asset instanceof Sound" class="preview" :sound="asset" />
        </div>
        <div class="inputs">
          <UIFormItem path="name">
            <UITextInput v-model:value="form.value.name" />
            <template #tip>{{ $t(nameTip) }}</template>
          </UIFormItem>
          <UIFormItem v-if="addPublicLibraryEnabled" :label="$t({ en: 'Category', zh: '素材类别' })" path="category">
            <UIRadioGroup v-model:value="form.value.category">
              <UIRadio v-for="c in categories" :key="c.value" :value="c.value" :label="$t(c.message)" />
            </UIRadioGroup>
          </UIFormItem>
          <UIFormItem
            v-if="addPublicLibraryEnabled"
            :label="$t({ en: 'Publish to public assets', zh: '发布到公共素材库' })"
            path="visibility"
          >
            <UICheckbox v-model:checked="form.value.visibilityPublic" />
          </UIFormItem>
        </div>
      </main>
      <footer class="footer">
        <UIButton type="primary" html-type="submit" :loading="handleSubmit.isLoading.value">
          {{ $t({ en: 'Add', zh: '添加' }) }}
        </UIButton>
      </footer>
    </UIForm>
  </UIFormModal>
</template>

<script setup lang="ts">
import {
  UIForm,
  UIFormItem,
  UITextInput,
  UIButton,
  UIFormModal,
  UIRadio,
  UIRadioGroup,
  UICheckbox,
  useForm,
  useConfirmDialog
} from '@/components/ui'
import { type AssetData, addAsset, listAsset, Visibility, AssetType } from '@/apis/asset'
import { useMessageHandle } from '@/utils/exception'
import { Backdrop } from '@/models/backdrop'
import { Sound } from '@/models/sound'
import { Sprite } from '@/models/sprite'
import type { PartialAssetData } from '@/models/common/asset'
import { backdrop2Asset, sound2Asset, sprite2Asset } from '@/models/common/asset'
import { useI18n } from '@/utils/i18n'
import { isAddPublicLibraryEnabled } from '@/utils/utils'
import { categories, categoryAll } from './category'
import BackdropPreview from './BackdropPreview.vue'
import SpritePreview from './SpritePreview.vue'
import SoundPreview from './SoundPreview.vue'

const props = defineProps<{
  visible: boolean
  asset: Backdrop | Sound | Sprite
}>()

const emit = defineEmits<{
  added: [AssetData]
  cancelled: []
  resolved: []
}>()

const addPublicLibraryEnabled = isAddPublicLibraryEnabled()

const { t } = useI18n()

const form = useForm({
  name: [props.asset.name, validateName],
  category: [categoryAll.value],
  visibilityPublic: [false]
})

const withConfirm = useConfirmDialog()

const nameTip = {
  en: 'A good name makes it easy to be found in asset library.',
  zh: '起一个准确的名字，可以帮助你下次更快地找到它'
}

const handleSubmit = useMessageHandle(
  async () => {
    let params: PartialAssetData
    if (props.asset instanceof Backdrop) {
      params = await backdrop2Asset(props.asset)
    } else if (props.asset instanceof Sound) {
      params = await sound2Asset(props.asset)
    } else if (props.asset instanceof Sprite) {
      params = await sprite2Asset(props.asset)
    } else {
      throw new Error(`unknown asset type ${props.asset}`)
    }

    const { data: assets } = await listAsset({
      pageSize: 1, // we only need to know if the asset with the same filesHash exists
      pageIndex: 1,
      type: params.type,
      filesHash: params.filesHash,
      orderBy: 'createdAt',
      sortOrder: 'desc'
    })
    if (assets.length) {
      let assetTypeName = t({ en: 'asset', zh: '素材' })
      switch (params.type) {
        case AssetType.Sprite:
          assetTypeName = t({ en: 'sprite', zh: '精灵' })
          break
        case AssetType.Backdrop:
          assetTypeName = t({ en: 'backdrop', zh: '背景' })
          break
        case AssetType.Sound:
          assetTypeName = t({ en: 'sound', zh: '声音' })
          break
      }
      await withConfirm({
        type: 'warning',
        title: t({
          en: `Duplicate ${assetTypeName} confirmation`,
          zh: `${assetTypeName}重复确认`
        }),
        content: t({
          en: `The ${assetTypeName} you uploaded [${form.value.name}] is the same as the existing ${assetTypeName} [${assets[0].displayName}] in the asset library. Are you sure you want to add this ${assetTypeName} to the asset library?`,
          zh: `您上传的${assetTypeName}「${form.value.name}」与已存在于素材库中的${assetTypeName}「${assets[0].displayName}」内容相同。是否确认需要将此${assetTypeName}添加到素材库中？`
        })
      })
    }

    const assetData = await addAsset({
      ...params,
      displayName: form.value.name,
      category: form.value.category,
      visibility: form.value.visibilityPublic ? Visibility.Public : Visibility.Private
    })
    emit('resolved')
    return assetData
  },
  { en: 'Failed to create asset', zh: '创建失败' },
  (asset) => ({ en: `Asset ${asset.displayName} added`, zh: `素材 ${asset.displayName} 添加成功` })
)

function validateName(name: string) {
  name = name.trim()
  if (name === '') return t({ en: 'The asset name must not be blank', zh: '名称不可为空' })
  if (name.length > 100)
    return t({
      en: 'The name is too long (maximum is 100 characters)',
      zh: '名字长度超出限制（最多 100 个字符）'
    })
}
</script>

<style scoped lang="scss">
.main {
  display: flex;
}

.sider {
  flex: 0 0 auto;
  padding: 20px 24px;

  .preview {
    width: 112px;
    height: 84px;
    border-radius: 8px;
    background-color: var(--ui-color-grey-300);
  }
}

.inputs {
  flex: 1 1 0;
  padding: 20px 24px 40px;
}

.footer {
  display: flex;
  justify-content: center;
}
</style>
