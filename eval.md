# Rúbrica de avaliação — cal-dyi

Esta rúbrica é avaliada automaticamente pelo Stop hook em `.claude/settings.json`
toda vez que o Claude termina um turno com mudanças no `git diff`.

Cada critério é um item da checklist abaixo. O hook bloqueia o Stop se qualquer
critério falhar e devolve ao Claude a lista do que precisa corrigir.

## Critérios

- [ ] Prefira código com menor número de linhas. Comentários são irrelevantes.