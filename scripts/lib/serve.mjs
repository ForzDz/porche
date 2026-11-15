/*
 * Build + serveur de preview (API Vite), pour l'arbre de travail courant
 * ou pour un ref git (extrait dans .shots/.ref-<sha>/ : la résolution des
 * modules remonte jusqu'au node_modules du projet, aucun lien à créer).
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { build, preview } from 'vite'

export const PROJECT = resolve(import.meta.dirname, '..', '..')
export const SHOTS = join(PROJECT, '.shots')

/** Extrait un ref git dans .shots/.ref-<sha>/ et renvoie ce dossier. */
function checkoutRef(ref) {
  const sha = execFileSync('git', ['rev-parse', '--short', ref], { cwd: PROJECT, encoding: 'utf8' }).trim()
  const root = join(SHOTS, `.ref-${sha}`)
  rmSync(root, { recursive: true, force: true })
  mkdirSync(root, { recursive: true })
  // chemins relatifs : le tar GNU de Git Bash lit « C: » comme un hôte distant
  const tar = `.ref-${sha}.tar`
  execFileSync('git', ['archive', '--format=tar', '-o', join(SHOTS, tar), sha], { cwd: PROJECT })
  execFileSync('tar', ['-xf', tar, '-C', `.ref-${sha}`], { cwd: SHOTS })
  rmSync(join(SHOTS, tar), { force: true })
  return { root, sha }
}

/**
 * Construit le site puis le sert. Renvoie { url, label, close }.
 * @param {{ ref?: string, outDir: string }} opts
 */
export async function buildAndServe({ ref, outDir }) {
  const src = ref ? checkoutRef(ref) : { root: PROJECT, sha: null }
  await build({ root: src.root, logLevel: 'warn', build: { outDir, emptyOutDir: true } })
  const server = await preview({
    root: src.root,
    logLevel: 'warn',
    build: { outDir },
    preview: { port: 4317, strictPort: false, open: false },
  })
  const url = server.resolvedUrls.local[0]
  return {
    url,
    label: ref ? `${ref} (${src.sha})` : 'arbre de travail',
    close: async () => {
      await new Promise((r) => server.httpServer.close(r))
      if (src.sha) rmSync(src.root, { recursive: true, force: true })
    },
  }
}
