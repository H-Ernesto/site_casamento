# Gustavo & Débora — Convite Virtual de Casamento

Sistema de convite virtual com dashboard dos noivos, preparado arquiteturalmente para futura plataforma SaaS multi-casamento.

Última atualização: 06/10/2026

---

## Como rodar localmente

```bash
npm install            # instala dependências e gera o Prisma Client
npm run db:push        # cria/atualiza o banco SQLite (dev.db)
npm run db:seed        # cria GDadmin + casamento Gustavo & Débora (idempotente)
npm run dev            # http://localhost:3000
```

- **Área Administrativa (Noivos)**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
  - **Usuário**: `GDadmin`
  - **Senha**: `123456789` (atualizada com sucesso no banco pelo usuário)
- **Convite Público do Convidado**: `http://localhost:3000/gustavo-e-debora/[slug-do-convite]`
  - Exemplo criado no banco: [http://localhost:3000/gustavo-e-debora/teste-familia-abc123](http://localhost:3000/gustavo-e-debora/teste-familia-abc123)

---

## Arquitetura e Decisões Técnicas

- **Next.js 15 (App Router) + React 19 + TypeScript**
- **Tailwind CSS v4** com tokens personalizados da paleta oficial (`#7c8d5b`, `#ea8b54`, `#e8ab3d`, `#b9a0c9`, `#d98b84`) e fundo creme (`#ffedd5`).
- **Prisma 6 + SQLite** (local dev) preparado com queries e schema portáveis para PostgreSQL (produção).
- **Multi-Tenant (Isolamento total por Casamento)**: Todas as entidades (`Invitation`, `Favor`, `Gift`, `GalleryPhoto`, `WeddingSettings`) são vinculadas ao `Wedding`. Toda ação no admin passa por `requireAdmin()` e é filtrada pelo `wedding.id` do noivo logado.
- **Segurança**:
  - Sessão com JWT em cookie `httpOnly`, criptografia segura com `jose`.
  - Senhas armazenadas com hash `bcryptjs` (salt 12).
  - Rate limiting contra ataques de força bruta no login.
  - Middleware em `src/middleware.ts` protegendo todas as rotas `/admin/*`.
  - Slugs dos convites gerados com sufixo randômico único (ex: `joao-maria-k7x9q2`), impedindo adivinhação de outros convites.
  - Endpoints públicos não expõem nomes de compradores de presentes nem dados sensíveis de outros convidados.

---

## ✅ O que já está 100% Implementado e Funcional

### 1. Convite Público (`/[casamento]/[convite]`)
Seguindo rigorosamente a ordem das 10 seções especificadas:
1. **ABERTURA**: Foto hero em tela cheia com contraste sofisticado, títulos com tipografia decorativa, contagem regressiva em tempo real com os 3 estados (antes: "Faltam X dias...", no dia: "É hoje!", após: "Nosso grande dia já aconteceu."), endereço e dress code.
2. **MENSAGEM INICIAL**: Texto de boas-vindas personalizado para o convite, posicionado obrigatoriamente antes de Nossa História.
3. **NOSSA HISTÓRIA**: Texto oficial do casal.
4. **ÁLBUM DE FOTOS**: Carrossel responsivo com suporte a toque/swipe no celular, setas, indicadores e teclado, sem legendas.
5. **INFORMAÇÕES DO CASAMENTO**: Local, endereço, data, horário e dress code.
6. **LISTA DE PRESENTES + PIX** (na mesma seção):
   - Cada presente exibe: Nome, Valor em R$, botão externo "Comprar presente" e botão interativo "Já comprei este presente".
   - Cada clique soma +1 unidade e exibe "X unidades já escolhidas" sem bloquear o item e sem expor nomes de convidados.
   - Bloco Pix com a chave e botão interativo "COPIAR PIX" com feedback visual ("Chave Pix copiada!").
7. **LEMBRANCINHAS**:
   - Exibido quando o convite possui lembrancinhas (`favorCount > 0`).
   - Coleta perguntas personalizadas para cada unidade (ex: Tamanho 1: M, Tamanho 2: G) e salva com feedback visual.
8. **CONFIRMAÇÃO DE PRESENÇA (RSVP)**:
   - Suporte aos 4 tipos de convite: Individual (limite 1), Individual + acompanhante (limite 2 com mensagem especial), Casal (limite 2), Família (limite configurado pelos noivos).
   - Validação estrita de limites no servidor e no cliente (Adultos + Crianças nunca ultrapassam o limite).
   - Aviso de idade explícito: até 12 anos = criança; a partir de 13 anos = adulto.
   - Opções "Confirmo presença" e "Não poderei comparecer" (status Recusado).
   - Permite que o convidado retorne ao convite e altere sua confirmação a qualquer momento.
9. **LOCAL / MAPA**: Endereço textual, mapa interativo embutido e botão "ABRIR NO GOOGLE MAPS".
10. **MENSAGEM FINAL**: Mensagem de agradecimento e nomes dos noivos.

### 2. Painel Administrativo dos Noivos (`/admin`)
- **Autenticação**: Login seguro com usuário/senha, rate limit, fluxo obrigatório de troca de senha no 1º acesso.
- **Visão Geral (`/admin`)**:
  - Cards: Total de convites, Confirmados, Não responderam, Recusaram, Total de adultos, Total de crianças, Total de pessoas confirmadas.
  - Resumo das Lembrancinhas (total previsto vs. total confirmado).
  - Resumo dos Presentes (itens cadastrados vs. unidades escolhidas).
- **Gerenciamento de Convites (`/admin/convites`)**:
  - Tabela com Convite, Tipo, Limite, Adultos, Crianças, Total, Status (Confirmado/Recusado/Não respondeu), Lembrancinhas e Ações.
  - Busca por nome, filtros rápidos e ordenação.
  - Criação de novos convites com seleção de tipo, nome, limite para família e quantidade de lembrancinhas.
  - Edição de convites existentes.
  - Arquivamento/Restauro de convites (preserva histórico e dados).
  - Botão "Copiar link" e "Compartilhar" (Web Share API com fallback).
  - **Exportação para Excel (.xlsx)**: Gera planilha com todas as colunas obrigatórias e respostas de lembrancinhas.
- **Gerenciamento de Lembrancinhas (`/admin/lembrancinhas`)**:
  - Criação e edição de lembrancinhas com perguntas personalizadas (com opções pré-definidas ou texto livre).
  - Resumo da quantidade total necessária de lembrancinhas.
  - Agrupamento de respostas com contadores (ex: Tamanho M: 20, Tamanho G: 31).
  - **Modal de detalhamento**: Ao clicar em uma resposta, lista exatamente de quais convites vieram aqueles dados.
- **Gerenciamento e Vitrine de Presentes**:
  - Imagem personalizada via URL ou upload por presente (`imageUrl` adicionada ao banco e aos formulários).
  - Vitrine pública em **Grid Responsivo** elegante em todas as resoluções de tela.
  - **Pix Avulso integrado diretamente no Grid** com o mesmo formato de card e branding oficial do Pix.
  - **Card com indicador de comprado**: quando presenteado, o card recebe overlay sutil e badge redonda verde oliva no canto superior direito (`#7c8d5b`) com o número de vezes adquirido.
  - **Modal Interativo de Compra**: ao clicar no card, abre modal com foto grande, descrição, valor, chave Pix exclusiva com botão copiar, link direto da loja e fluxo de confirmação com alerta antes de salvar o presente como comprado.
- **Dashboard dos Noivos com Gráficos Circulares**:
  - Gráficos donut/circulares estilizados na paleta oficial (`#7c8d5b`, `#ea8b54`, `#e8ab3d`, `#b9a0c9`) para:
    - Status de confirmações (RSVP) e taxa de retorno.
    - Composição de convidados (Adultos vs Crianças).
    - Meta e % de lembrancinhas garantidas.
    - Progresso da lista de presentes adquiridos.
- **Barra Lateral do Admin Retrátil e Centralizada**:
  - Navegação verticalmente centralizada na tela.
  - Expande suavemente ao passar o mouse por cima (`hover`), mantendo a tela do dashboard limpa e minimalista.
  - Gaveta adaptada para uso em smartphones (mobile-friendly).
- **Configurações do Casamento (`/admin/configuracoes`)**:
  - Edição completa de: Nomes dos noivos, Data e horário, Local, Endereço, Link Google Maps, Dress Code, Mensagens (inicial, história, rsvp, final), Chave Pix.
  - Upload e alteração da Foto Principal do Convite.
  - **Gerenciador de Álbum**: Adicionar fotos (upload ou URL), excluir fotos, reordenar fotos (esquerda/direita) e definir Foto de Capa.

### 3. Melhorias Recentes de Interface e Navegação
- **Barra de Navegação Flutuante Inteligente (`Navbar.tsx`)**:
  - Fixa no topo, surge suavemente com fade-in e transição suave após o usuário rolar a tela (> 320px), sem cobrir o hero de abertura.
  - Links diretos com rolagem suave para todas as seções (Início, História, Álbum, Informações, Presentes, Lembranças, Presença, Local).
  - Suporte completo a desktop e pílulas deslizáveis horizontais sem barra de rolagem (`no-scrollbar`) para dispositivos móveis.
  - Destaca dinamicamente a seção ativa conforme a leitura do convidado.
- **Destaque Visual de Fundo para "Nossa História" e "Álbum"**:
  - Nossa História: fundo marfim acetinado (`#fffbf5`) com bordas sutis em tom oliva, proporcionando leitura intimista de carta/pergaminho.
  - Álbum de Fotos: fundo verde alecrim / sage botânico (`#f4f7ee`) destacando as imagens emolduradas com contraste harmonioso.
- **Identidade Oficial do Pix**:
  - Aplicação do arquivo vetorial oficial `pix.svg` nos cards de presentes, modais de confirmação e no card de Pix Avulso.
- **Integração com a Lista da Havan**:
  - Botão de destaque centralizado posicionado imediatamente após os cards da lista de presentes, direcionando para a lista oficial da Havan (`https://lista.havan.com.br/Convidado/ItensListaPresente/965780`).
- **Sessão Persistente (Sem Necessidade de Re-login)**:
  - Duração da sessão estendida para 365 dias com cookies de validade explícita (`maxAge` + `expires`).
  - Middleware inteligente: redireciona automaticamente para `/admin` se o usuário já estiver logado ao tentar acessar `/admin/login`.
  - Página inicial `/` redireciona noivos autenticados direto para o painel administrativo e convidados para seu último convite acessado.
- **Acessibilidade e Usabilidade dos Modais de Presente**:
  - Botão de fechar (X) substituído por componente circular de alto contraste (fundo branco, sombra, ícone nítido, realce em verde oliva no hover).
  - Suporte a tecla `ESC` e clique fora da janela (backdrop) para fechamento rápido em qualquer dispositivo.

---

## 📋 Próximas Melhorias (Opcionais / Para Produção)

1. **Deploy / Produção**:
   - Conectar com banco PostgreSQL em nuvem (Neon, Supabase ou Vercel Postgres) mudando o `provider` no `schema.prisma`.
   - Armazenamento de uploads em nuvem (Vercel Blob ou Supabase Storage).
   - Configurar `metadataBase` com a URL do domínio final.
2. **Otimização de Imagens**:
   - Reduzir as fotos originais de 15MB para versões otimizadas de até 2000px antes do upload final.

