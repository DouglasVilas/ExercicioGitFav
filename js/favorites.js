import { GithubUser } from "./GithubUser.js"

//classe que vai conter a lógica dos dados
//como os dados serão estruturados
export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()

    }
    load() {
        this.entries = JSON.parse(localStorage.getItem
            ('@github-favorites')) || []
   
    }
    save() { //para salvar que esta em tela, nao perder caso a tela 6eja recarregada!
        localStorage.setItem('@github-favorites', JSON.stringify(this.entries)) 
    }
    async add(username) {   //função assíncronas, serve para rodar somente quando uma promessa for comprida  "async e await" (promise)
        try {   //tentar

            const lowercaseUsername = username.toLowerCase(); // Convertendo para minúsculas

            const userExists = this.entries.find(entry => entry.login.toLowerCase() === lowercaseUsername )   //"find" encontre
      

            if (userExists) {
                throw new Error('Usuário já cadastrado')
            }

   
            const user = await GithubUser.search(username)

            if (user.login === undefined) {
                throw new Error('USUÁRIO NÃO ENCONTRADO') //dispara o erro!
            }

            this.entries = [user, ...this.entries]  //metodo de imutabilidade para adicionar os usuarios em fila ... 
            this.update()
            this.save()
        }
        catch (error) {   //capta os erros e transmite para o usuario  e para facilitar fazer a manutencao 
            alert(error.message)
         }
    
    }

    
    delete(user) {
        //Higher-order functions 
    
        this.entries = this.entries.filter(entry => entry.login !== user.login);
    
        // Atualiza a visualização após a exclusão do usuário
        this.update();
        this.save(); // Salva as alterações no armazenamento local
    }
}

//classe que vai criar a visualização e eventos do HTML

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)

         this.tbody = this.root.querySelector('table tbody')

        this.update()
        this.onadd() 
    }
   
    onadd() {
        const inputField = this.root.querySelector('.search input');
        const addButton = this.root.querySelector('.search button')
        
        inputField.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                const value = inputField.value.trim();
                this.add(value);
        }
    });
        
        addButton.onclick = () => {
            const { value } = this.root.querySelector('.search input')
            this.add(value)

        }
           
    }
    
    update() {
        this.removeAllTr();
    
        if (this.entries.length === 0) {
            const emptyRow = this.createEmptyRow();
            this.tbody.appendChild(emptyRow);
        } else {
            this.entries.forEach(user => {
                const row = this.createRow();
                row.querySelector('.user img').src = `https://github.com/${user.login}.png`;
                row.querySelector('.user img').alt = `Imagem de ${user.name}`;
                row.querySelector('.user a').href = `https://github.com/${user.login}`;
                row.querySelector('.user p').textContent = user.name;
                row.querySelector('.user span').textContent = `/${user.login}`;
                row.querySelector('.repositories').textContent = user.public_repos;
                row.querySelector('.followers').textContent = user.followers;
                
                row.querySelector('.remove').onclick = () => {
                    const isOk = confirm('Tem certeza que deseja deletar essa usuário?');
                    if(isOk){
                        this.delete(user);
                    }
                };
                
                this.tbody.appendChild(row); // Adiciona a linha apenas uma vez
            });
        }
    }
    
    createEmptyRow() {
        const tr = document.createElement('tr');
        tr.classList.add('usernull');
        tr.innerHTML = `
            <td colspan="4" rowspan="10" >
                <img src="./img/Estrela.svg" alt="Estrela">
                <h1>Nenhum favorito ainda</h1>
              
            
        `
        return tr;
    }

    createRow() {
        const tr = document.createElement('tr')
        tr.innerHTML = ` 

                <td class="user">
                    <img src="https://github.com/DouglasVilas.png" target="_blank" alt="Perfil do Usuário">
                    <a href="https://github.com/DouglasVilas" target="_blank">
                        <p>Douglas Vilas Boas</p>
                        <span>DouglasVilas</span>
                    </a>
                
                </td>
                <td class="repositories">
                    100
                </td>
                <td class="followers">
                    1000
                </td>   
                
                <td>
                    <button class="remove">Remover</button>
                </td>    
       
        
        `
        return tr
        
    }
    
    removeAllTr() {
    
        this.tbody.querySelectorAll('tr').forEach((tr) => {
                tr.remove()
        
            });
        
    }
}

