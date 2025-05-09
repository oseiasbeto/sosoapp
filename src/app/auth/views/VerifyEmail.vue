<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import { useAuth } from '@/hooks/auth'

// Inicializa as ferramentas necessárias
const route = useRoute()
const router = useRouter()
const { verifyEmail } = useAuth()

// Função para verificar o email
const handleEmailVerification = async () => {
  // Pega o token da query string
  const token = route.query.token

  // Se não tiver token, redireciona para Login
  if (!token) {
    router.replace({ name: 'Login' })
    return
  }
  // Chama a função de verificação do email do repositório de autenticação
  await verifyEmail(token).then(() => {
    // Mostra toast de sucesso
    toast.success('Conta verificada com sucesso!', {
      autoClose: 3000,
      position: 'bottom-center'
    })

    // Redireciona para home
    router.replace({ name: 'Home' })
  }).catch(err => {
    console.log(err)
    toast.error('Erro ao verificar o email. Tente novamente.', {
      autoClose: 3000,
      position: 'bottom-center'
    })

    // Redireciona para Login em caso de erro
    router.replace({ name: 'Login' })
  })
}

// Executa a verificação quando o componente é montado
onMounted(() => {
  handleEmailVerification()
})
</script>

<template>
  <div>
    <!-- Pode adicionar um loading enquanto verifica -->
  </div>
</template>