<script setup lang="ts">
/** 与 HomeEcosystem stack 顺序一致；不含 gitee.svg */
const logos = [
  { src: '/logos/vue.svg', alt: 'Vue' },
  { src: '/logos/vite.svg', alt: 'Vite' },
  { src: '/logos/pinia.svg', alt: 'Pinia' },
  { src: '/logos/element.svg', alt: 'Element Plus' },
  { src: '/logos/elysia.svg', alt: 'Elysia' },
  { src: '/logos/bun.svg', alt: 'Bun' },
  { src: '/logos/drizzle-orm.svg', alt: 'Drizzle ORM' },
  { src: '/logos/postgresql.svg', alt: 'PostgreSQL' },
  { src: '/logos/redis.svg', alt: 'Redis' },
  { src: '/logos/docker.svg', alt: 'Docker' },
  { src: '/logos/pm2.svg', alt: 'PM2' },
]
</script>

<template>
  <div
    class="ea-logo-cloud relative w-full overflow-hidden py-10 md:py-12"
    aria-label="技术栈 Logo"
    role="region"
  >
    <div class="ea-logo-cloud__track flex w-max">
      <ul class="ea-logo-cloud__row flex shrink-0 items-center gap-12 px-6 md:gap-16 md:px-8">
        <li v-for="logo in logos" :key="logo.src">
          <span class="ea-logo-cloud__item">
            <img
              :src="logo.src"
              :alt="logo.alt"
              :title="logo.alt"
              class="ea-logo-cloud__img"
              loading="lazy"
              decoding="async"
              draggable="false"
            >
          </span>
        </li>
      </ul>
      <ul
        class="ea-logo-cloud__row flex shrink-0 items-center gap-12 px-6 md:gap-16 md:px-8"
        aria-hidden="true"
      >
        <li v-for="logo in logos" :key="`${logo.src}-dup`">
          <span class="ea-logo-cloud__item">
            <img
              :src="logo.src"
              alt=""
              class="ea-logo-cloud__img"
              loading="lazy"
              decoding="async"
              draggable="false"
            >
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.ea-logo-cloud {
  -webkit-mask-image: linear-gradient(
    90deg,
    transparent,
    #000 18%,
    #000 82%,
    transparent
  );
  mask-image: linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent);
}

.ea-logo-cloud__track {
  animation: ea-logo-cloud-marquee 65s linear infinite;
}

.ea-logo-cloud:hover .ea-logo-cloud__track {
  animation-play-state: paused;
}

@keyframes ea-logo-cloud-marquee {
  to {
    transform: translateX(-50%);
  }
}

.ea-logo-cloud__item {
  display: flex;
  height: 3rem;
  width: 6rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
}

@media (min-width: 768px) {
  .ea-logo-cloud__item {
    height: 3.5rem;
    width: 7rem;
  }
}

.ea-logo-cloud__img {
  max-height: 100%;
  max-width: 100%;
  height: 1.75rem;
  width: auto;
  object-fit: contain;
  opacity: 0.4;
  filter: grayscale(1);
  transition:
    opacity 0.3s ease,
    filter 0.3s ease;
}

@media (min-width: 768px) {
  .ea-logo-cloud__img {
    height: 2rem;
  }
}

.ea-logo-cloud__item:hover .ea-logo-cloud__img {
  opacity: 1;
  filter: grayscale(0);
}

@media (prefers-reduced-motion: reduce) {
  .ea-logo-cloud {
    -webkit-mask-image: none;
    mask-image: none;
  }

  .ea-logo-cloud__track {
    animation: none;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
    max-width: 100%;
    padding: 0 1rem;
  }

  .ea-logo-cloud__row[aria-hidden='true'] {
    display: none;
  }

  .ea-logo-cloud__row {
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem 1.5rem;
    padding: 0;
  }
}
</style>
