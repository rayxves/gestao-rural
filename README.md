# 🌾 GestãoAgro

Este projeto combina automação, inteligência artificial e uma interface intuitiva para criar um **sistema completo de gestão agrícola** via **Telegram + painel web**, com foco em simplificar o dia a dia no campo.

<br/>

## 📚 Sumário

- [🎯 Objetivo do Projeto](#-objetivo-do-projeto)
- [🤖 Funcionalidades do Bot Telegram](#-funcionalidades-do-bot-telegram)
- [💻 Painel Web](#-painel-web)
- [🖼️ Exemplos Visuais](#️-exemplos-visuais)
- [🛠 Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [✅ Resultados Esperados](#-resultados-esperados)
- [🧪 Teste agora](#-teste-agora)
- [👩‍💻 Desenvolvido por](#-desenvolvido-por)

---
<br/>

## 🎯 Objetivo do Projeto

O objetivo é **facilitar o registro e a análise de atividades agrícolas**, permitindo que qualquer produtor — com ou sem conhecimento técnico — possa:

- Registrar atividades usando **linguagem natural** via Telegram
- Visualizar dados em uma **interface Web com tabelas, gráficos e filtros**
- Tomar decisões com base em **dados reais de produção, lucro e gastos**
- Reduzir burocracia e melhorar a **rastreabilidade e eficiência**

---
<br/>

## 🤖 Funcionalidades do Bot Telegram

- Registro rápido de atividades agrícolas:
  - 🌱 Plantio
  - 🌾 Colheita
  - 💰 Vendas
  - 📦 Insumos
  - 🧾 Gastos
  - 👨‍🌾 Trabalhos

Com **IA integrada**, o bot entende mensagens como:
> *"Plantei milho dia 20/06/2025 em 5 hectares na fazenda Boa Vista"*

E transforma isso em um registro estruturado no banco de dados.

### Funcionalidades adicionais:

- 📊 **Resumo semanal da produção** para registros de plantio, colheita, venda e gastos
- 💬 **IA para responder dúvidas sobre agricultura**
- 👥 **Gestão de colaboradores**:
  - O produtor pode adicionar o bot em um grupo com seus colaboradores, funcionários ou familiares
  - **Registros feitos no grupo são automaticamente vinculados ao produtor**
  - Os participantes do grupo podem:
    - Registrar atividades diretamente no grupo
    - Acessar o painel pelo comando `ver dados` no bot privado  
    - No painel, visualizar **apenas os registros que eles próprios cadastraram** e importar dados via planilhas Excel

---
<br/>

## 💻 Painel Web

### 📋 Tabelas 

- Filtros por data, cultura e propriedade
- Visualização, edição e exclusão de registros
- Upload dos dados via Excel

### 📈 Gráficos Dinâmicos

- Produção por cultura
- Gastos e lucro
- Insumos 
- Distribuição de trabalho e custo

### 📁 Importação Excel

- Importação de planilhas Excel para preencher registros automaticamente

### ☁️ Clima e cultura

- Visualização do clima atual por localização do produtor
- Alertas de risco climático para culturas plantadas no último mês

No site também é possível **cadastrar novas propriedades** e **vincular registros a elas**.

---
<br/>

## 🖼️ Exemplos Visuais

<p align="center">
  <img src="https://github.com/rayxves/gestao-rural/blob/main/assets/tela_inicial.png" alt="Tela inicial do sistema com botão para acessar o bot" width="700"/>
</p>

<p align="center">
  <i>🔹 Tela inicial do painel, com botão direto para o bot no Telegram.</i>
</p>

<br/>

<p align="center">
  <img src="https://github.com/rayxves/gestao-rural/blob/main/assets/tela_registros.png" alt="Visualização de registros no painel" width="700"/>
</p>

<p align="center">
  <i>🔹 Exemplo de tela com registros.</i>
</p>

---
<br/>

## 🛠 Tecnologias Utilizadas

- 🌐 **Webhook HTTP (Telegram)** – comunicação entre o bot e o sistema
- 🔄 **n8n** – automações backend e processamento de mensagens
- 🧬 **Supabase / PostgreSQL** – banco de dados e autenticação
- ☁️ **Open-Meteo API** – integração climática
- 🎨 **Lovable** – frontend moderno integrado à Supabase

---
<br/>

## ✅ Resultados Esperados

- Maior controle sobre as atividades agrícolas
- Menos tempo gasto com burocracia
- Informações centralizadas e acessíveis
- Análises reais para **decisões mais inteligentes no campo**

---
<br/>

## 🧪 Teste agora

- Acesse o site: [https://gestao-rural.lovable.app](https://gestao-rural.lovable.app)
- Converse com o bot: [@GestaoRuralBot](https://web.telegram.org/k/#@gestao_rural_bot)

<br/>

## 👩‍💻 Desenvolvido por [@rayxves](https://github.com/rayxves)
