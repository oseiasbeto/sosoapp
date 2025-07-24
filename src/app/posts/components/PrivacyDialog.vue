<template>
  <Dialog :open="isOpen" @close="setIsOpen">
    <div class="fixed inset-0 bg-black/30 z-50" aria-hidden="true" />
    <div class="fixed inset-0 flex items-center justify-center p-4 z-50">
      <DialogPanel
        class="w-full max-w-md rounded-xl bg-gray-900 border border-gray-700 shadow-xl"
      >
        <div class="p-5">
          <!-- Cabeçalho -->
          <div class="flex justify-between items-start mb-4">
            <div>
              <DialogTitle class="text-xl font-semibold text-white">
                Configurações de privacidade
              </DialogTitle>
              <DialogDescription class="text-sm text-gray-400 mt-1">
                Defina quem pode ver esta publicação.
              </DialogDescription>
            </div>
            <button
              @click="setIsOpen(false)"
              class="text-gray-400 hover:text-white rounded-full p-1"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>

          <div class="border-t border-gray-700 my-4"></div>

          <!-- Opções de privacidade -->
          <div class="space-y-4">
            <div v-for="option in privacyOptions" :key="option.value">
              <input
                type="radio"
                :id="option.value"
                :value="option.value"
                v-model="selectedPrivacy"
                class="hidden"
              />
              <label
                :for="option.value"
                class="flex items-center justify-between p-3 rounded-lg cursor-pointer"
                :class="{
                  'bg-blue-900/30 border border-blue-500': selectedPrivacy === option.value,
                  'bg-gray-800 hover:bg-gray-700': selectedPrivacy !== option.value
                }"
              >
                <div class="flex items-center space-x-3">
                  <component :is="option.icon" class="h-5 w-5 text-gray-300" />
                  <div>
                    <div class="font-medium text-white">{{ option.label }}</div>
                    <div class="text-xs text-gray-400">{{ option.description }}</div>
                  </div>
                </div>
                <div
                  v-if="selectedPrivacy === option.value"
                  class="text-blue-400"
                >
                  <CheckIcon class="h-5 w-5" />
                </div>
              </label>
            </div>
          </div>

          <div class="border-t border-gray-700 my-4"></div>

          <!-- Configurações adicionais -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-white">Permitir comentários</div>
                <div class="text-xs text-gray-400">
                  Controla quem pode comentar nesta publicação
                </div>
              </div>
              <Switch
                v-model="allowComments"
                :class="allowComments ? 'bg-blue-500' : 'bg-gray-600'"
                class="relative inline-flex h-6 w-11 items-center rounded-full"
              >
                <span class="sr-only">Permitir comentários</span>
                <span
                  :class="allowComments ? 'translate-x-6' : 'translate-x-1'"
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                />
              </Switch>
            </div>
          </div>

          <!-- Rodapé -->
          <div class="mt-6 space-y-3">
            <button
              @click="saveSettings"
              class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Salvar
            </button>
            <p class="text-xs text-gray-400">
              Você pode alterar suas configurações padrão em 
              <span class="font-semibold">Configurações → Privacidade</span>.
            </p>
          </div>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogDescription,
  Switch,
} from '@headlessui/vue'
import {
  CheckIcon,
  XMarkIcon,
  GlobeAmericasIcon,
  UserGroupIcon,
  LockClosedIcon,
  UserIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  isOpen: Boolean,
  initialPrivacy: {
    type: String,
    default: 'public',
  },
  initialAllowComments: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['close', 'save'])

const privacyOptions = [
  {
    value: 'public',
    label: 'Público',
    description: 'Qualquer pessoa pode ver esta publicação',
    icon: GlobeAmericasIcon,
  },
  {
    value: 'friends',
    label: 'Amigos',
    description: 'Somente seus amigos podem ver',
    icon: UserGroupIcon,
  },
  {
    value: 'private',
    label: 'Privado',
    description: 'Somente você pode ver',
    icon: LockClosedIcon,
  },
  {
    value: 'custom',
    label: 'Personalizado',
    description: 'Escolha quem pode ver',
    icon: UserIcon,
  },
]

const selectedPrivacy = ref(props.initialPrivacy)
const allowComments = ref(props.initialAllowComments)

const setIsOpen = (value) => {
  emit('close', value)
}

const saveSettings = () => {
  emit('save', {
    privacy: selectedPrivacy.value,
    allowComments: allowComments.value,
  })
  setIsOpen(false)
}
</script>