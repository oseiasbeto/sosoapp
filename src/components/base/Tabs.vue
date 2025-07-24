<template>
  <div class="relative">
    <div
      ref="tabsContainer"
      class="flex px-4 border-b gap-4 border-light-border dark:border-dark-border overflow-x-auto scrollbar-hide whitespace-nowrap"
    >
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        class="relative"
      >
        <button
          @click="selectTab(index)"
          class="py-3 font-medium text-light-text-secondary dark:text-dark-text-light text-sm transition-colors"
          :class="{'text-light-text-primary dark:text-dark-text-primary': activeTab === index}"
        >
          {{ tab.label }}
          <!-- Borda estática apenas na tab ativa -->
          <div
            v-if="activeTab === index"
            class="absolute bottom-0 left-0 right-0 h-[3px] bg-primary"
          ></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
    validator: (value) => value.every(item => 'label' in item)
  },
  modelValue: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue'])

const tabsContainer = ref(null)
const activeTab = ref(props.modelValue)

const selectTab = async (index) => {
  activeTab.value = index
  emit('update:modelValue', index)
  await nextTick()
  scrollToTab(index)
}

const scrollToTab = (index) => {
  if (!tabsContainer.value) return
  
  const container = tabsContainer.value
  const tabs = container.querySelectorAll('.relative')
  const selectedTab = tabs[index]
  
  if (!selectedTab) return
  
  const containerWidth = container.clientWidth
  const tabLeft = selectedTab.offsetLeft
  const tabWidth = selectedTab.clientWidth
  const scrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2)
  
  container.scrollTo({
    left: scrollLeft,
    behavior: 'smooth'
  })
}

onMounted(() => {
  scrollToTab(activeTab.value)
})
</script>

<style>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>