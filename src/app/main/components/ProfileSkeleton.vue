<template>
    <div class="pointer-events-none">
        <!--start background image area-->
        <div class="w-full h-[150px] bg-light-card dark:bg-dark-card relative">
        </div>
        <!--end background image area-->

        <!--start content area-->
        <div class="px-4 pb-2 pt-3">
            <!--start actions area-->
            <div class="pl-[90px] gap-1 flex items-center justify-end">
            
                <button
                    class="flex text-light-text-primary dark:text-dark-text-light bg-light-card dark:bg-dark-card active:brightness-100 text-sm font-semibold gap-2 justify-center items-center bg-light-dark rounded-full w-[130px] h-[34px]">
                </button>

            </div>
            <!--end actions area-->

        </div>
        <!--end content area-->
    </div>
    <!--end content area-->

    <!--start avatar area-->
    <div class="absolute top-[110px] left-[10px]">
        <div class="border-[3px] rounded-full border-light-bg dark:border-dark-bg">
            <div class="w-[90px] bg-light-card dark:bg-dark-card rounded-full h-[90px]"></div>
        </div>
    </div>
    <!--end avatar area-->
</template>