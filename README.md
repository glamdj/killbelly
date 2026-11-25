# KillBelly

App Android pessoal: alarmes de treino, lembretes de água e chá, registo de peso (diário) e cintura (semanal), contador de cerveja, plano semanal com checklist, gráficos de progresso, chás e infusões, receitas fit com ingredientes de Angola e lista de compras.

## Instalar no telemóvel

1. No GitHub, abra **Releases** (coluna da direita) e descarregue o ficheiro `KillBelly-N.apk` mais recente.
   (Em alternativa: separador **Actions** → última execução → **KillBelly-APK**.)
2. Abra o ficheiro no telemóvel e permita "Instalar apps desconhecidas" para o navegador/gestor de ficheiros.
3. Abra a app e aceite **Notificações** e **Alarmes e lembretes**.
4. Em **Definições** na app, siga os passos do Huawei Watch GT 6 e toque em "Enviar notificação de teste".

As atualizações instalam-se por cima (mesma assinatura), sem perder os dados.

## Desenvolvimento

```bash
npm install
npm run build          # gera www/app.js a partir de src/
npx cap sync android   # copia para o projeto Android
```

Cada `push` para `main` gera uma nova APK automaticamente (GitHub Actions).

- `src/data.js` — plano semanal, sessões, chás e receitas
- `src/notify.js` — agendamento das notificações
- `src/app.js` — interface
