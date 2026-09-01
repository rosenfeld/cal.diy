# CLAUDE.md — Cal.com monorepo

Instruções e decisões de domínio para agentes de IA trabalhando neste repositório.

---

## Horário comercial e fusos horários

### Horário comercial padrão
- **Dias:** Segunda a sexta (seg–sex)
- **Horário:** 09:00–18:00 (fuso do organizador)

### Fuso horário
- O fuso principal é **o fuso do dono da agenda** (varia por organizador, não é fixo).
- Usar **UTC offset fixo** — não aplicar ajuste automático de horário de verão (DST); ignorar regras DST das zonas IANA.
- Os usuários/clientes são **globais** (múltiplos fusos ao redor do mundo).

### Exibição de horários
- Mostrar **ambos os fusos** lado a lado: fuso do organizador e fuso do visitante.
- Converter automaticamente para o fuso local do visitante, mas também exibir o fuso do organizador.

### Slots fora do horário comercial
- **Exibir com aviso** — não bloquear; mostrar o slot mas sinalizar que está fora do horário comercial do organizador.

### Eventos que cruzam a meia-noite
- **Permitidos** — suporte a eventos cujo horário de término cai no dia seguinte (ex: 22h–02h).

---

## Desenvolvimento local

- PostgreSQL na porta 5432, usuário `rodrigo`
- `DATABASE_URL` configurado e seed executado
