/*
    Aluno: [Felipe Grochovski]
*/

document.addEventListener('DOMContentLoaded', () => {
    // seleção dos elementos DOM para interação
    const campoAcao = document.getElementById('acao');
    const campoId = document.getElementById('id');
    const campoTitulo = document.getElementById('titulo');
    const campoUrlImagem = document.getElementById('urlImagem');
    const campoUrlMiniatura = document.getElementById('urlMiniatura');
    const campoIdAlbum = document.getElementById('idAlbum');
    const botaoAcao = document.getElementById('botaoAcao');
    const corpoTabela = document.querySelector('#tabelaFotos tbody');
    const botaoPrimeira = document.getElementById('botaoPrimeira');
    const botaoAnterior = document.getElementById('botaoAnterior');
    const botaoProximo = document.getElementById('botaoProximo');
    const botaoUltima = document.getElementById('botaoUltima');
    const inputPagina = document.getElementById('inputPagina');
    const botaoIrParaPagina = document.getElementById('botaoIrParaPagina');
    const infoPagina = document.getElementById('infoPagina');

    // URL base da API
    const urlApi = 'https://jsonplaceholder.typicode.com/photos';

    // Variáveis da paginação
    let paginaAtual = 1;
    const fotosPorPagina = 50;
    let totalFotos = 0;

    // carregar dados do LocalStorage ou da API
    let fotos = JSON.parse(localStorage.getItem('fotos')) || [];

    // função para salvar dados no LocalStorage
    const salvarNoLocalStorage = () => {
        localStorage.setItem('fotos', JSON.stringify(fotos));
    };

    // função para validar campos obrigatórios
    const validarCampos = () => {
        if (!campoTitulo.value || !campoUrlImagem.value || !campoUrlMiniatura.value || !campoIdAlbum.value) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return false;
        }
        return true;
    };

    // função para atualizar o formulário conforme a ação selecionada
    const atualizarFormulario = () => {
        const acaoSelecionada = campoAcao.value;

        // bloquear/desbloquear campos
        if (acaoSelecionada === 'inserir') {
            campoId.disabled = true; // O ID é gerado automaticamente
            campoTitulo.disabled = false;
            campoUrlImagem.disabled = false;
            campoUrlMiniatura.disabled = false;
            campoIdAlbum.disabled = false;
            botaoAcao.textContent = 'Inserir';
            botaoAcao.classList.remove('bg-yellow-500', 'hover:bg-yellow-600', 'bg-red-500', 'hover:bg-red-600', 'bg-blue-500', 'hover:bg-blue-600');
            botaoAcao.classList.add('bg-green-500', 'hover:bg-green-600');
        } else if (acaoSelecionada === 'alterar') {
            campoId.disabled = false; // O ID é necessário para alterar
            campoTitulo.disabled = false;
            campoUrlImagem.disabled = false;
            campoUrlMiniatura.disabled = false;
            campoIdAlbum.disabled = false;
            botaoAcao.textContent = 'Alterar';
            botaoAcao.classList.remove('bg-green-500', 'hover:bg-green-600', 'bg-red-500', 'hover:bg-red-600', 'bg-blue-500', 'hover:bg-blue-600');
            botaoAcao.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
        } else if (acaoSelecionada === 'excluir') {
            campoId.disabled = false; // Apenas o ID é necessário para excluir
            campoTitulo.disabled = true;
            campoUrlImagem.disabled = true;
            campoUrlMiniatura.disabled = true;
            campoIdAlbum.disabled = true;
            botaoAcao.textContent = 'Excluir';
            botaoAcao.classList.remove('bg-green-500', 'hover:bg-green-600', 'bg-yellow-500', 'hover:bg-yellow-600', 'bg-blue-500', 'hover:bg-blue-600');
            botaoAcao.classList.add('bg-red-500', 'hover:bg-red-600');
        } else if (acaoSelecionada === 'listar') {
            campoId.disabled = true;
            campoTitulo.disabled = true;
            campoUrlImagem.disabled = true;
            campoUrlMiniatura.disabled = true;
            campoIdAlbum.disabled = true;
            botaoAcao.textContent = 'Listar';
            botaoAcao.classList.remove('bg-green-500', 'hover:bg-green-600', 'bg-yellow-500', 'hover:bg-yellow-600', 'bg-red-500', 'hover:bg-red-600');
            botaoAcao.classList.add('bg-blue-500', 'hover:bg-blue-600');
        }
    };

    // função para fazer requisições GET
    const fazerRequisicaoGet = async (url) => {
        try {
            const resposta = await fetch(url);
            if (!resposta.ok) {
                throw new Error('Erro ao buscar dados');
            }
            return await resposta.json();
        } catch (erro) {
            console.error('Erro na requisição GET:', erro);
            return null;
        }
    };

    // função para fazer requisições POST
    const fazerRequisicaoPost = async (url, dados) => {
        try {
            const resposta = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dados),
            });
            if (!resposta.ok) {
                throw new Error('Erro ao criar recurso');
            }
            return await resposta.json();
        } catch (erro) {
            console.error('Erro na requisição POST:', erro);
            return null;
        }
    };

    // função para fazer requisições PUT
    const fazerRequisicaoPut = async (url, dados) => {
        try {
            const resposta = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dados),
            });
            if (!resposta.ok) {
                throw new Error('Erro ao atualizar recurso');
            }
            return await resposta.json();
        } catch (erro) {
            console.error('Erro na requisição PUT:', erro);
            return null;
        }
    };

    // função para fazer requisições DELETE
    const fazerRequisicaoDelete = async (url) => {
        try {
            const resposta = await fetch(url, {
                method: 'DELETE',
            });
            if (!resposta.ok) {
                throw new Error('Erro ao deletar recurso');
            }
            return true; // Retorna true se a deleção foi bem-sucedida
        } catch (erro) {
            console.error('Erro na requisição DELETE:', erro);
            return false;
        }
    };

    // função para listar fotos com paginação
    const listarFotos = async (pagina = 1) => {
        try {
            if (fotos.length === 0) {
                fotos = await fazerRequisicaoGet(urlApi);
                salvarNoLocalStorage();
            }

            totalFotos = fotos.length;

            const inicio = (pagina - 1) * fotosPorPagina;
            const fim = inicio + fotosPorPagina;
            const fotosPaginadas = fotos.slice(inicio, fim);

            corpoTabela.innerHTML = '';

            fotosPaginadas.forEach(foto => {
                const linha = document.createElement('tr');
                linha.innerHTML = `
                    <td class="p-2">${foto.id}</td>
                    <td class="p-2">${foto.title}</td>
                    <td class="p-2">${foto.albumId}</td>
                    <td class="p-2"><img src="${foto.url}" alt="Imagem" class="w-20 h-20 object-cover"></td>
                    <td class="p-2"><img src="${foto.thumbnailUrl}" alt="Miniatura" class="w-10 h-10 object-cover"></td>
                `;
                corpoTabela.appendChild(linha);
            });

            infoPagina.textContent = `Página ${pagina} de ${Math.ceil(totalFotos / fotosPorPagina)}`;
            paginaAtual = pagina;
        } catch (erro) {
            console.error('Erro ao listar fotos:', erro);
        }
    };

    // função para adicionar uma nova foto
    const adicionarFoto = async () => {
        if (!validarCampos()) return;

        const novaFoto = {
            title: campoTitulo.value,
            url: campoUrlImagem.value,
            thumbnailUrl: campoUrlMiniatura.value,
            albumId: campoIdAlbum.value,
        };

        const fotoAdicionada = await fazerRequisicaoPost(urlApi, novaFoto);
        if (fotoAdicionada) {
            fotos.push(fotoAdicionada);
            salvarNoLocalStorage();
            alert('Foto adicionada com sucesso!');
            listarFotos(paginaAtual);
        }
    };

    // função para alterar uma foto
    const atualizarFoto = async () => {
        const id = parseInt(campoId.value);

        if (!id) {
            alert('Por favor, insira o ID da foto que deseja alterar.');
            return;
        }

        const fotoAtualizada = {
            id: id,
            title: campoTitulo.value,
            url: campoUrlImagem.value,
            thumbnailUrl: campoUrlMiniatura.value,
            albumId: campoIdAlbum.value,
        };

        const fotoAtualizadaResposta = await fazerRequisicaoPut(`${urlApi}/${id}`, fotoAtualizada);
        if (fotoAtualizadaResposta) {
            const indiceFoto = fotos.findIndex(foto => foto.id === id);
            fotos[indiceFoto] = fotoAtualizadaResposta;
            salvarNoLocalStorage();
            alert('Foto alterada com sucesso!');
            listarFotos(paginaAtual);
        }
    };

    // função para excluir uma foto
    const excluirFoto = async () => {
        const id = parseInt(campoId.value);

        if (!id) {
            alert('Por favor, insira o ID da foto que deseja excluir.');
            return;
        }

        const deletado = await fazerRequisicaoDelete(`${urlApi}/${id}`);
        if (deletado) {
            const indiceFoto = fotos.findIndex(foto => foto.id === id);
            fotos.splice(indiceFoto, 1);
            salvarNoLocalStorage();
            alert(`Foto com ID ${id} excluída com sucesso!`);
            campoId.value = '';
            listarFotos(paginaAtual);
        }
    };

    // eventos de paginação
    botaoPrimeira.addEventListener('click', () => listarFotos(1));
    botaoAnterior.addEventListener('click', () => {
        if (paginaAtual > 1) listarFotos(paginaAtual - 1);
    });
    botaoProximo.addEventListener('click', () => {
        if (paginaAtual < Math.ceil(totalFotos / fotosPorPagina)) listarFotos(paginaAtual + 1);
    });
    botaoUltima.addEventListener('click', () => listarFotos(Math.ceil(totalFotos / fotosPorPagina)));
    botaoIrParaPagina.addEventListener('click', () => {
        const pagina = parseInt(inputPagina.value);
        if (pagina >= 1 && pagina <= Math.ceil(totalFotos / fotosPorPagina)) {
            listarFotos(pagina);
        } else {
            alert('Página inválida!');
        }
    });

    // atualiza o formulário ao mudar a seleção
    campoAcao.addEventListener('change', atualizarFormulario);

    // configuração inicial
    atualizarFormulario();

    // evento do botão de ação
    botaoAcao.addEventListener('click', async () => {
        const acaoSelecionada = campoAcao.value;

        if (acaoSelecionada === 'inserir') {
            await adicionarFoto();
        } else if (acaoSelecionada === 'alterar') {
            await atualizarFoto();
        } else if (acaoSelecionada === 'excluir') {
            await excluirFoto();
        } else if (acaoSelecionada === 'listar') {
            await listarFotos();
        }
    });

    // carrega todos os dados iniciais
    listarFotos();
});