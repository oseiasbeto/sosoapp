<template>
    <!--start header-->
    <div class="flex mb-4 items-center justify-between">
        <div class="flex items-center gap-4">
            <button @click="router.back()">Voltar</button>
            <h1>Editar perfil</h1>
        </div>

        <div>
            <button @click="handleSubmit"
                :disabled="!isFormValid || isFormEqualsUserData || loadingEditProfile || loadingCheckUsername">
                {{ loadingEditProfile ? 'Salvando...' : 'Salvar' }}
            </button>
        </div>
    </div>
    <!--end header-->

    <!--start body-->
    <div>
        <div>
            <!--start name group form-->
            <div class="flex mb-2">
                <Input @input="validateName(form.name)" v-model="form.name"
                    :error="{ show: errors.name.show, message: errors.name.message }" title="Nome" label="name" />
            </div>
            <!--end name group form-->

            <!--start username group form-->
            <div class="flex mb-2">
                <Input @input="validateUsername(form.username)" v-model="form.username"
                    :error="{ show: errors.username.show, message: errors.username.message }" title="Nome de utilizador"
                    label="Nome de utilizador" />
            </div>
            <!--end username group form-->

            <!--start birth date group form-->
            <div class="flex mb-2">
                <ul class="flex items-center gap-3">
                    <li class="grow-[2]">
                        <SelectInput v-model="form.birth_date.month" title="Mês" label="month" :options="months"
                            :error="{ show: false, message: 'Selecione uma opção válida' }" />
                    </li>
                    <li class="grow">
                        <SelectInput title="Dia" label="day" :options="generateDays" v-model="form.birth_date.day"
                            :error="{ show: false, message: 'Selecione uma opção válida' }" />
                    </li>
                    <li class="grow">
                        <SelectInput title="Ano" label="year" :options="generateYears" v-model="form.birth_date.year"
                            :error="{ show: false, message: 'Selecione uma opção válida' }" />
                    </li>
                </ul>
            </div>
            <!--end birth date group form-->

            <!--start gender group form-->
            <div class="flex mb-2">
                <SelectInput v-model="form.gender" title="Genero" label="gender" :options="genders"
                    :error="{ show: false, message: 'Selecione uma opção válida' }" />

            </div>
            <!--end gender group form-->

            <!--start location group form-->
            <div class="flex mb-2">
                <Input v-model="form.location" :error="{ show: errors.location.show, message: errors.location.message }"
                    title="Localizacao" label="location" />
            </div>
            <!--end location group form-->

            <!--start bio group form-->
            <div class="flex mb-2">
                <Input v-model="form.bio" :error="{ show: errors.bio.show, message: errors.bio.message }" title="Bio"
                    label="Bio" />
            </div>
            <!--end bio group form-->

            <!--start website group form-->
            <div class="flex mb-2">
                <Input v-model="form.website" :error="{ show: errors.bio.show, message: errors.bio.message }"
                    title="Website" label="website" />
            </div>
            <!--end website form-->
        </div>
    </div>
    <!--end body-->
</template>

<script setup>
import Input from '@/components/inputs/Input.vue';
import SelectInput from '@/components/inputs/SelectInput.vue';
import { useProfile } from '@/app/profiles/profiles.hook';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
const { getUserById, loading: loadingGetById } = useProfile();
const { checkUsername, loading: loadingCheckUsername } = useProfile();
const { editProfile, loading: loadingEditProfile } = useProfile();

const store = useStore()
const route = useRoute()
const router = useRouter()

const user_id = computed(() => route.params.user_id);
const profile = computed(() => store.getters.currentProfile);
const user = computed(() => store.getters.currentUser);

const isFormValid = computed(() => {
    return form.value.name !== "" &&
        !errors.value.name.show &&
        form.value.username !== "" &&
        !errors.value.username.show &&
        !errors.value.website.show &&
        !errors.value.location.show
});

const isFormEqualsUserData = computed(() => {
    return form.value.profile_image === user.value.profile_image &&
        form.value.name === user.value.name &&
        form.value.username === user.value.username &&
        form.value.gender === user.value.gender &&
        form.value.location === user.value.location &&
        form.value.birth_date.month === user.value.birth_date.month &&
        form.value.birth_date.day === user.value.birth_date.day &&
        form.value.birth_date.year === user.value.birth_date.year &&
        form.value.bio === user.value.bio &&
        form.value.website === user.value.website
});


const generateDays = computed(() => {
    // Definir o mês atual caso o selectedMonth não tenha valor
    const currentMonth = form.value.birth_date.month || new Date().getMonth() + 1 // getMonth retorna o mês de 0 a 11

    // Obter o ano atual
    const currentYear = new Date().getFullYear()

    // Obter o número de dias no mês selecionado
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate()

    // Gerar os dias do mês
    const days = []
    for (let day = 1; day <= lastDayOfMonth; day++) {
        days.push({ value: day, label: `${day}` }) // Formato { value, label }
    }

    return days
})

const generateYears = computed(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1900 + 1 }, (_, i) => ({
        value: currentYear - i,
        label: `${currentYear - i}`
    }));
});

const form = ref({
    name: "",
    username: "",
    profile_image: {
        public_id: null,
        original: null,
        low: null,
        high: null,
        medium: null
    },
    birth_date: {
        month: null,
        day: null,
        year: null
    },
    website: "",
    gender: "prefer_not_to_say",
    location: null,
    bio: ""
})

const errors = ref({
    name: {
        show: false,
        message: ""
    },
    username: {
        show: false,
        message: ""
    },
    birth_date: {
        show: false,
        message: ""
    },
    gender: {
        show: false,
        message: ""
    },
    phone_number: {
        show: false,
        message: ""
    },
    website: {
        show: false,
        message: ""
    },
    location: {
        show: false,
        message: ""
    },
    bio: {
        show: false,
        message: ""
    }
})

const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
]

const genders = [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Femenino' },
    { value: 'prefer_not_to_say', label: 'Personalizado' }
]

const validateName = (name) => {
    if (name == '') {
        errors.value.name.show = true;
        errors.value.name.message = "Qual é o seu nome?";
    } else if (name.length < 3 || name.length > 50) {
        errors.value.name.show = true;
        errors.value.name.message = "Deve ter 3 a 50 caracteres.";
    } else {
        errors.value.name.show = false;
        errors.value.name.message = "";
    }
};

const validateUsername = async (username) => {
    const usernameRegex = /^(?!.*[_.]{2})^(?![_.])[\w.]{3,50}(?<![_.])$/;
    if (username && !usernameRegex.test(username)) {
        errors.value.username.show = true;
        errors.value.username.message = "Deve ter 3 a 50 caracteres, sem espaços ou símbolos inválidos..";
    } else {
        if (username.length && username !== user.value?.username) {
            checkUsername(username).then(() => {
                errors.value.username.show = false;
                errors.value.username.message = "";
            }).catch((err) => {
                errors.value.username.show = true;
                errors.value.username.message = err.response.data.message;
            })
        } else {
            if (!username.length) {
                errors.value.username.show = true;
                errors.value.username.message = "Este campo e obrigatorio";
            } else {
                errors.value.username.show = false;
                errors.value.username.message = "";
            }
        }
    }
}

const handleSubmit = async () => {
    if (isFormValid.value && !loadingGetById.value && !loadingCheckUsername.value && !isFormEqualsUserData.value) {
        await editProfile(form.value).then(() => {
            router.back()
        })
    }
}

onMounted(async () => {
    if (!profile.value?._id) {
        await getUserById(user_id.value).then(() => {
            form.value = {
                profile_image: user.value.profile_image,
                name: user.value.name,
                username: user.value.username,
                birth_date: {
                    month: user.value?.birth_date.month,
                    day: user.value?.birth_date.day,
                    year: user.value?.birth_date.year
                },
                gender: user.value.gender,
                website: user.value.website,
                location: user.value.location,
                bio: user.value.bio
            }
        });
    } else {
        loadingGetById.value = false
        form.value = {
            profile_image: user.value.profile_image,
            name: user.value.name,
            username: user.value.username,
            birth_date: {
                month: user.value?.birth_date.month,
                day: user.value?.birth_date.day,
                year: user.value?.birth_date.year
            },
            gender: user.value.gender,
            website: user.value.website,
            location: user.value.location,
            bio: user.value.bio
        }
    }
});

</script>