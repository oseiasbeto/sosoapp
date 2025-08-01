<template>
    <svg aria-label="A carregar…" class=" text-dark-text-light w-6 h-6 spinner-small" role="img" viewBox="0 0 100 100">
        <rect fill="currentColor" height="10" opacity="0" rx="5" ry="5" transform="rotate(-90 50 50)" width="28" x="67"
            y="45"></rect>
        <rect fill="currentColor" height="10" opacity="0.125" rx="5" ry="5" transform="rotate(-45 50 50)" width="28"
            x="67" y="45"></rect>
        <rect fill="currentColor" height="10" opacity="0.25" rx="5" ry="5" transform="rotate(0 50 50)" width="28" x="67"
            y="45"></rect>
        <rect fill="currentColor" height="10" opacity="0.375" rx="5" ry="5" transform="rotate(45 50 50)" width="28"
            x="67" y="45"></rect>
        <rect fill="currentColor" height="10" opacity="0.5" rx="5" ry="5" transform="rotate(90 50 50)" width="28" x="67"
            y="45"></rect>
        <rect fill="currentColor" height="10" opacity="0.625" rx="5" ry="5" transform="rotate(135 50 50)" width="28"
            x="67" y="45"></rect>
        <rect fill="currentColor" height="10" opacity="0.75" rx="5" ry="5" transform="rotate(180 50 50)" width="28"
            x="67" y="45"></rect>
        <rect fill="currentColor" height="10" opacity="0.875" rx="5" ry="5" transform="rotate(225 50 50)" width="28"
            x="67" y="45"></rect>
    </svg>
</template>

<style>
.spinner-small {
    animation-duration: .8s;
    animation-name: animate-spinner-small;
    animation-iteration-count: infinite;
    animation-timing-function: steps(8, end)
}

@keyframes animate-spinner-small {
    0% {
        transform: rotate(180deg);
    }

    100% {
        transform: rotate(540deg);
    }
}
</style>