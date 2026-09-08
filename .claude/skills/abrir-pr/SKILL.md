---
name: abrir-pr
description: Abre um Pull Request no fork rosenfeld/cal.diy a partir do trabalho atual — cria o branch se necessário, commita em Conventional Commits, faz push para o remote `rosenfeld` e cria a PR preenchendo o template do repositório. Use quando pedirem "abrir uma PR", "criar pull request", "subir essas mudanças", "open a PR" ou similar.
---

# Abrir PR

Fluxo completo de "trabalho local → Pull Request" neste repositório.

**Alvo fixo:** tudo acontece no fork **`rosenfeld/cal.diy`** — push no remote `rosenfeld`, PR com base em `rosenfeld/cal.diy:main`. Não abrir PR contra `origin` (calcom), `jaya` ou `favini` a menos que o usuário peça explicitamente.

**Ferramenta:** use o `gh` CLI. O MCP do GitHub pode estar indisponível; o `gh` já está autenticado como `rosenfeld`.

---

## Passo 1 — Levantar o estado

Rode em paralelo:

```bash
git status --short
git branch --show-current
git log --oneline rosenfeld/main..HEAD   # commits já feitos neste branch
git diff --stat rosenfeld/main...HEAD
```

Decida em qual dos casos você está:

| Estado | Ação |
|---|---|
| Mudanças não commitadas, branch = `main` | Passo 2 (criar branch) → Passo 3 |
| Mudanças não commitadas, branch de feature | Passo 3 (commitar) |
| Tudo commitado, branch de feature | Passo 4 (push) |
| Nada commitado e nada modificado | Pare e informe que não há o que enviar |

**Nunca** commite direto em `main`, `jaya-main`, `favini-main` ou `add-mcp-server`.

---

## Passo 2 — Criar o branch

Se estiver em `main` (ou em qualquer branch "de tracking" de outro remote), crie um branch a partir de `main` atualizado:

```bash
git fetch rosenfeld main
git switch -c <nome-do-branch> rosenfeld/main
```

Nome do branch: kebab-case descritivo, sem prefixo obrigatório. Se as mudanças resolvem uma issue conhecida, use `fix/issue-<n>-<slug>` ou `feat/issue-<n>-<slug>`.

Se houver mudanças não commitadas antes de trocar de branch, elas seguem junto — confirme com `git status` depois do switch.

---

## Passo 3 — Commitar

Antes de commitar, rode as verificações que cobrem os arquivos tocados:

```bash
yarn lint          # ou biome nos arquivos alterados, se for um diff pequeno
yarn type-check
TZ=UTC yarn test <caminho-dos-testes-relevantes>
```

Não rode a suíte inteira (`yarn test` sem filtro) nem os e2e — é caro demais. Rode só o que cobre o diff. Se alguma verificação falhar, **corrija antes de commitar** e relate o que quebrou.

Mensagem de commit em **Conventional Commits**, seguindo o histórico do repositório:

```
<tipo>(<escopo>): <descrição no imperativo, minúscula, sem ponto final>
```

Tipos em uso aqui: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`.
Escopos comuns: `bookings`, `emails`, `calendar`, `i18n`, `booker`, `notifications`.

Exemplos reais do histórico:
- `feat(bookings): show warning for slots outside business hours`
- `fix(emails): customReplyToEmail no longer dropped when hideOrganizerEmail is true`
- `docs: add CLAUDE.md with business hours and timezone decisions`

Finalize a mensagem com:

```
Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
```

Se o diff cobre mais de uma preocupação, faça commits separados — o CONTRIBUTING pede PRs de responsabilidade única.

---

## Passo 4 — Push

```bash
git push -u rosenfeld <nome-do-branch>
```

Se o branch já tem upstream em outro remote, ainda assim publique em `rosenfeld` antes de abrir a PR.

---

## Passo 5 — Montar o corpo da PR

Baseie-se em `.github/PULL_REQUEST_TEMPLATE.md`, mas **preencha de verdade** — não deixe placeholders nem comentários HTML do template.

Estrutura mínima:

```markdown
## What does this PR do?

<1–3 parágrafos: o que muda e por quê. Se resolve uma issue, comece com "Fixes #N".>

## Mandatory Tasks (DO NOT REMOVE)

- [x] I have self-reviewed the code (A decent size PR without self-review might be rejected).
- [x] I have updated the developer docs if this PR makes changes that would require a documentation change. If N/A, write N/A here and check the checkbox.
- [x] I confirm automated tests are in place that prove my fix is effective or that my feature works.

## How should this be tested?

<Comandos exatos, dados mínimos necessários e resultado esperado.>
```

Regras:
- Só marque um checkbox obrigatório se ele for verdadeiro. Se não houver testes automatizados, **não marque** o terceiro item — escreva por que não há e deixe o usuário decidir.
- A seção "Visual Demo" só entra se a mudança for visível na UI; nesse caso, peça a imagem/vídeo ao usuário em vez de inventar.
- Remova a seção "Checklist" de negativas do template (aqueles bullets são coisas que o contribuidor *não* fez).
- Se o diff passar de 500 linhas ou 10 arquivos de código, avise o usuário que o CONTRIBUTING pede um split, mas abra a PR mesmo assim se ele confirmar.

Sempre termine o corpo com:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## Passo 6 — Criar a PR

Escreva o corpo em um arquivo temporário no scratchpad (evita problemas de escaping) e rode:

```bash
gh pr create \
  --repo rosenfeld/cal.diy \
  --base main \
  --head <nome-do-branch> \
  --title "<mesma convenção do commit principal>" \
  --body-file <arquivo>
```

Título da PR: mesma convenção do commit (`feat(escopo): ...`). Se a PR tem um único commit, reutilize a mensagem dele.

---

## Passo 7 — Reportar

Devolva ao usuário:
- A URL da PR
- Branch e base (`rosenfeld/<branch>` → `rosenfeld/cal.diy:main`)
- Resultado das verificações do Passo 3 (lint / type-check / testes), incluindo o que **não** foi rodado
- Qualquer ressalva: checkbox não marcado, PR grande, demo visual pendente

---

## Erros comuns

| Situação | Ação |
|---|---|
| `gh` não autenticado | Peça ao usuário para rodar `! gh auth login` |
| Branch já tem PR aberta | Não crie outra — mostre a existente (`gh pr view --repo rosenfeld/cal.diy`) e pergunte se deve atualizar |
| Push rejeitado (non-fast-forward) | Pare e mostre o erro; nunca use `--force` sem o usuário pedir |
| Conflito com `rosenfeld/main` | Relate e pergunte se deve fazer rebase |
| Testes falhando | Não abra a PR. Relate a saída e corrija ou pergunte |
