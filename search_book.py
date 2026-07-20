import os
import json
import re
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from google.genai.errors import APIError

class BookInfo(BaseModel):
    titulo: str | None = Field(description="Título do livro")
    autor: str | None = Field(description="Autor(es) do livro")
    editora: str | None = Field(description="Editora responsável pela publicação")
    ano_publicacao: int | None = Field(description="Ano de publicação da edição")
    numero_paginas: int | None = Field(description="Número de páginas")
    sinopse: str | None = Field(description="Breve sinopse do livro")
    lingua: str | None = Field(description="Língua do livro, ex: Português")
    preco_estimado_eur: float | None = Field(description="Preço estimado em Euros, se disponível")

def is_valid_isbn(isbn: str) -> bool:
    """Valida se a string fornecida tem o formato de um ISBN-10 ou ISBN-13."""
    # Remove hífens e espaços para a validação
    clean_isbn = re.sub(r'[- ]', '', isbn)
    # Verifica se tem 10 ou 13 caracteres (ISBN-10 pode terminar em 'X' ou 'x')
    if not re.match(r'^(?:\d{9}[\dX]|\d{13})$', clean_isbn, re.IGNORECASE):
        return False
    return True

def search_book_by_isbn(isbn: str) -> str:
    """
    Pesquisa dados de um livro pelo ISBN usando a API do Gemini e devolve um JSON estruturado.
    Requer a variável de ambiente GEMINI_API_KEY configurada.
    """
    
    if not is_valid_isbn(isbn):
        return json.dumps({"erro": "ISBN inválido. Deve conter 10 ou 13 caracteres válidos."})

    # Inicializa o cliente do Gemini
    # O SDK procura automaticamente pela variável de ambiente GEMINI_API_KEY
    try:
        client = genai.Client()
    except Exception as e:
        return json.dumps({"erro": f"Falha ao inicializar o cliente Gemini: {str(e)}"})

    system_instruction = (
        "És um assistente especializado no mercado livreiro de Portugal. "
        "O teu objetivo é encontrar dados precisos sobre livros publicados em Portugal "
        "através do ISBN fornecido. Se o livro for internacional mas tiver edição portuguesa, "
        "prioriza os dados da edição de Portugal. Se não encontrares dados reais, "
        "devolve um JSON com os campos vazios ou nulos, sem inventar informações."
    )

    prompt = f"Procura e extrai informações detalhadas sobre o livro com o ISBN: {isbn}"

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=BookInfo,
                temperature=0.1, # Baixa temperatura para respostas factuais e consistentes
            ),
        )
        return response.text
    except APIError as e:
        return json.dumps({"erro": f"Erro na API do Gemini: {str(e)}"})
    except Exception as e:
        return json.dumps({"erro": f"Erro inesperado durante a execução: {str(e)}"})

if __name__ == "__main__":
    # Exemplo de utilização do script
    # Requer instalação de dependências: pip install google-genai pydantic
    
    # Exemplo 1: Ensaio sobre a Cegueira (Edição PT)
    isbn_exemplo = "978-972-21-0956-8" 
    print(f"A pesquisar pelo ISBN: {isbn_exemplo}")
    
    # Executa a pesquisa
    resultado_json = search_book_by_isbn(isbn_exemplo)
    
    # Imprime o resultado
    print("\nResultado JSON:")
    print(resultado_json)
