# Cuidar · Rotina da Ana Luiza

Aplicativo web estático para registrar **individualmente** os cuidados e medicamentos previstos nos cinco dias informados pela família. Funciona no celular e no computador, sem conta ou servidor de dados. Está pronto para GitHub Pages.

## 1. Como publicar no GitHub Pages

1. Crie um repositório no GitHub. Por exemplo, `cuidar-ana`.
2. Faça upload **do conteúdo desta pasta** para a raiz do repositório: `index.html`, `style.css`, `app.js`, `sw.js`, `manifest.webmanifest`, `assets/` e este arquivo. Não faça upload apenas do ZIP.
3. Abra **Settings → Pages**, selecione **Deploy from a branch**, escolha a branch `main` e a pasta `/(root)`, e salve.
4. O GitHub Pages disponibilizará o site em um endereço do formato `https://SEU-USUARIO.github.io/cuidar-ana/` (confirme o endereço exato indicado nas configurações).
5. No primeiro acesso, informe a data correspondente ao **Dia 1** da quimioterapia e, opcionalmente, o nome de quem faz os registros.

Os caminhos são relativos, então o aplicativo funciona tanto em um site de projeto (`/cuidar-ana/`) como na raiz de um domínio personalizado.

## 2. Como colocar a foto na capa

Adicione a fotografia à pasta `assets` com o **nome exato** `ana-luiza.jpg`, mantendo a extensão `.jpg` em letras minúsculas. Uma foto de retrato vertical funciona melhor. A ausência da foto não causa erro: aparece o monograma `AL`.

**Privacidade:** a foto publicada no GitHub Pages e a programação escrita nos arquivos do aplicativo ficam acessíveis a quem visitar o endereço. Não publique informações que a família não queira tornar públicas. Um PIN somente em JavaScript não ofereceria proteção real.

## 3. Como registrar

- O aplicativo calcula as datas dos Dias 1 a 5 a partir da data inicial e permite navegar entre eles.
- Cada medicamento ou cuidado pode ser marcado separadamente como **registrado** ou **não administrado**. Um item não marcado continua **pendente**, sem presumir que tenha sido feito.
- Ao tocar em **Registrar**, o sistema anota o horário do dispositivo. Se a administração ocorreu em outro horário, toque em **Editar hora** para informar a hora correta.
- O espaço de **Anotações do dia** é salvo automaticamente.
- A opção das **20h** registra **ondansetrona OU olanzapina (2 comprimidos)**. O sistema impede registrar a olanzapina novamente às 22h quando ela já consta como administrada às 20h, e vice-versa.
- No **Dia 5**, o sistema repete a programação do Dia 4 **sem fexofenadina e sem cetoprofeno**, deixando a dipirona como **somente se houver dor**. Os itens condicionais não são exigidos para completar a contagem do dia.
- A sessão de quimioterapia é uma atividade do Dia 1, marcada como realizada separadamente dos medicamentos.
- Na engrenagem de configurações, é possível escolher outro ciclo ou iniciar um novo ciclo sem apagar os anteriores.

**Importante:** a programação foi transcrita da mensagem da família; o aplicativo não verifica prescrição, dose, intervalo, interações ou substituições de medicamentos. Confirme as instruções — especialmente a opção das 20h/22h e o regime do Dia 5 — com a equipe de oncologia antes do uso. Em caso de dose perdida, dúvida ou sintoma, use as orientações da equipe médica, e não este aplicativo para decidir o que tomar.

## 4. Onde os registros ficam salvos?

Os registros são salvos automaticamente no **localStorage do navegador usado**. Isso permite fechar o navegador, voltar no dia seguinte e encontrar o histórico, desde que seja o **mesmo perfil, navegador e dispositivo**, sem apagar os dados do site.

**Não há sincronização automática entre celulares.** O GitHub Pages hospeda apenas arquivos estáticos. Caso uma pessoa use o celular dela e outra use outro aparelho, os registros serão independentes. Para transferir dados manualmente, abra **Configurações → Baixar backup** e, no outro aparelho, **Configurações → Restaurar backup**. A restauração substitui os registros daquele dispositivo; não faz mesclagem colaborativa.

Recomendação: escolha **um único aparelho principal** para os registros e faça um backup JSON periodicamente, guardando-o em local privado. Navegação anônima, limpeza de dados do navegador e alguns processos de gerenciamento de armazenamento podem apagar os registros locais.

## 5. Instalar na tela inicial

- **Android/Chrome:** abra o endereço do site, toque no menu `⋮` e escolha a opção de instalar/adicionar à tela inicial, quando disponível.
- **iPhone/Safari:** abra o endereço do site, toque em Compartilhar e escolha **Adicionar à Tela de Início**.

O projeto inclui manifesto e service worker para permitir carregamento offline após acesso online inicial. Isso não substitui o backup.

## 6. Arquivos incluídos

```text
index.html                   Interface e estrutura da página
style.css                    Cores, layout responsivo e impressão
app.js                       Programação dos 5 dias e registros
manifest.webmanifest         Configuração para instalação como app
sw.js                        Cache offline
assets/
  LEIA-ME.txt                Orientação sobre a foto da capa
  icone.svg                  Ícone do site
  icone-192.png              Ícone para instalação
  icone-512.png              Ícone para instalação
  ana-luiza.jpg              <-- ADICIONE SUA FOTO AQUI
```

## 7. Se mudar a prescrição

É necessário atualizar a função `scheduleFor(day)` em `app.js` e publicar os arquivos atualizados. Uma atualização de código **não deve ser tratada como nova orientação médica**: somente faça alterações conforme prescrição confirmada. Os registros anteriores continuam gravados no dispositivo; confira cuidadosamente o histórico se alterar identificadores de medicamentos ou horários.

---

Ferramenta de organização de cuidados, não é prontuário eletrônico, sistema de alertas clínicos ou substituto da equipe assistencial.
