# AUTH Arthurzxy - TODO

## Backend / Database
- [x] Schema: tabela resellers (revendedores)
- [x] Schema: tabela key_stock (estoque de keys por tipo)
- [x] Schema: tabela generated_keys (histórico de keys geradas)
- [x] Migração SQL aplicada no banco
- [x] Auth própria: login admin (Arthur/arthurzxy12) e revendedor por usuário/senha
- [x] JWT session para autenticação customizada
- [x] Procedure: login (admin e revendedor)
- [x] Procedure: logout
- [x] Procedure: dashboard stats (total revendedores, estoque, keys geradas, top ranking)
- [x] Procedure: criar revendedor
- [x] Procedure: listar revendedores
- [x] Procedure: pausar/ativar revendedor
- [x] Procedure: excluir revendedor
- [x] Procedure: adicionar créditos a revendedor
- [x] Procedure: adicionar keys ao estoque
- [x] Procedure: listar estoque por tipo
- [x] Procedure: limpar estoque por tipo
- [x] Procedure: gerar key (revendedor consome crédito)
- [x] Procedure: histórico de keys (admin = todas, revendedor = suas)
- [x] Procedure: ranking de revendedores

## Frontend
- [x] Tema global dark cyberpunk/neon (verde/ciano, tipografia impactante)
- [x] Página de login única (usuário + senha)
- [x] Dashboard admin: cards de stats + top ranking + ações rápidas
- [x] Página de gerenciamento de revendedores (criar, pausar, excluir, adicionar créditos)
- [x] Página de estoque geral (adicionar keys, ver disponível por tipo, limpar)
- [x] Página de ranking (admin)
- [x] Painel do revendedor: saldo, gerar key, histórico
- [x] Roteamento por role (admin vs revendedor)
- [x] Proteção de rotas

## Testes
- [x] Teste de login admin (correto e incorreto)
- [x] Teste de session sem cookie
- [x] Teste de procedures protegidas sem autenticação
- [x] Teste de logout


## Novas Funcionalidades (Sprint 2)
- [x] Backend: Procedure para gerar múltiplas keys (1-50) de uma vez
- [x] Backend: Consumir créditos proporcionalmente (1 crédito por key)
- [x] Frontend: Input para quantidade de keys (1-50)
- [x] Frontend: Modal exibindo todas as keys geradas
- [x] Frontend: Botão "Copiar Todas as Keys" no modal
- [x] Frontend: Exibir estoque disponível por tipo para o revendedor
- [x] Frontend: Atualizar estoque em tempo real após gerar keys
- [x] Testes: Gerar múltiplas keys com validação de quantidade
