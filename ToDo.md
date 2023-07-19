# Requisitos Funcionais

- [x] O usuário deve poder criar uma nova conta de usuário;
- [x] O usuário deve poder cadastrar uma nova refeição;
- [ ] O usuário deve poder editar uma refeição cadastrada por ele;
- [ ] O usuário deve poder apagar uma refeição cadastrada por ele;
- [x] O usuário deve poder listar todas as refeições cadastradas por ele;
- [ ] O usuário deve poder visualizar todos os dados de uma única refeição; 
- [ ] O usuário deve poder visualizar a métrica de total de refeições registradas; 
- [ ] O usuário deve poder visualizar a métrica de total de refeições dentro da dieta; 
- [ ] O usuário deve poder visualizar a métrica de total de refeições fora da dieta; 
- [ ] O usuário deve poder visualizar a métrica de melhor sequência; 


# Regra de Negócio

- [x] Deve ser possível criar um usuário;
- [x] Deve ser possível identificar o usuário entre as requisições;
- [x] Deve ser possível registrar uma refeição feita, com as seguintes informações:
    *As refeições devem ser relacionadas a um usuário.
    - [x] Nome
    - [x] Descrição
    - [x] Data e Hora
    - [x] Está dentro ou não da dieta
- [ ] Deve ser possível editar uma refeição, podendo alterar todos os dados acima;
- [ ] Deve ser possível apagar uma refeição;
- [x] Deve ser possível listar todas as refeições de um usuário;
- [ ] Deve ser possível visualizar uma única refeição;
- [ ] Deve ser possível recuperar as métricas de um usuário
    - [ ] Quantidade total de refeições registradas
    - [ ] Quantidade total de refeições dentro da dieta
    - [ ] Quantidade total de refeições fora da dieta
    - [ ] Melhor sequência de refeições dentro da dieta
- [ ] O usuário só pode visualizar, editar e apagar as refeições o qual ele criou;
