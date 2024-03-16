<script lang="ts">
  import { onMount } from "svelte";

  import type { Session } from "lucia";
  import type { GuestbookResponseBody } from "~/lib/types";

  export let session: Session | null;
  export let entries: Array<{
    name: string;
    message: string;
  }>;

  let isAuthenticating = false;
  let messageInput: HTMLInputElement | null;
  let isSubmitting = false;
  let error: string | null = null;

  onMount(() => messageInput?.focus());

  async function submit(event: SubmitEvent) {
    isSubmitting = true;
    error = null;

    const formData = new FormData(event.currentTarget as HTMLFormElement);

    const response = await fetch("/api/guestbook", {
      method: "POST",
      body: formData,
    });

    isSubmitting = false;

    const responseBody: GuestbookResponseBody = await response.json();

    if (!responseBody.success) {
      error = responseBody.message;
      return;
    }

    entries = [responseBody.entry, ...entries];

    if (messageInput) {
      messageInput.value = "";
    }
  }

  async function logout() {
    isAuthenticating = true;
    await fetch("/api/logout", { method: "POST" });
    location.reload();
  }
</script>

{#if !session}
  <a
    href="/login/github"
    class="not-prose flex w-fit items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 py-2 font-medium transition-colors hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800/60 hover:dark:bg-neutral-800"
    data-astro-prefetch="false"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="h-5 w-5"
    >
      <path
        d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
      ></path>
      <path d="M9 18c-4.51 2-5-2-7-2"></path>
    </svg>
    Sign in with GitHub
  </a>
{:else}
  <form on:submit|preventDefault={submit}>
    <div class="flex relative">
      <input
        bind:this={messageInput}
        type="text"
        name="message"
        required
        disabled={isSubmitting || isAuthenticating}
        class="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-black placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 dark:border-neutral-600 dark:bg-neutral-800/60 dark:text-white dark:ring-offset-neutral-900 placeholder:dark:text-neutral-400 dark:focus-visible:ring-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
        placeholder="Leave a message..."
        autocomplete="off"
      />

      <button
        type="submit"
        disabled={isSubmitting || isAuthenticating}
        class="absolute flex h-10 w-14 items-center justify-center rounded-r-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm transition-colors enabled:hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white enabled:hover:dark:bg-neutral-600 dark:focus-visible:ring-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed right-0"
      >
        {#if isSubmitting}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="animate-spin h-5 w-5"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
          </svg>
        {:else}
          Sign
        {/if}
      </button>
    </div>

    <span class="text-sm text-red-500">{error ?? ""}</span>
  </form>

  <form on:submit|preventDefault={logout}>
    <button
      type="submit"
      disabled={isAuthenticating}
      class="text-xs text-neutral-900 enabled:underline decoration-neutral-400 decoration-2 underline-offset-2 transition-all enabled:hover:decoration-neutral-500 enabled:hover:decoration-[3px] enabled:hover:underline-offset-[3px] dark:text-neutral-50 dark:decoration-neutral-500 enabled:hover:dark:decoration-neutral-400 disabled:opacity-50"
    >
      {#if isAuthenticating}
        Signing out...
      {:else}
        Sign out
      {/if}
    </button>
  </form>
{/if}

<ol class="list-none p-0 text-sm">
  {#each entries as { name, message }}
    <li class="my-4 p-0">
      <span class="text-neutral-500 dark:text-neutral-400">{name}: </span>
      <span class="text-black dark:text-white">{message}</span>
    </li>
  {/each}
</ol>
