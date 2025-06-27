import csv

try:
    with open('/opt/render/project/src/data/users.csv', 'r') as file:
        reader = csv.reader(file)
        # Faça algo com os dados do CSV
        for row in reader:
            print(row)
except FileNotFoundError:
    print("Erro: Arquivo users.csv não encontrado.")
except Exception as e:
    print(f"Erro ao ler o arquivo CSV: {e}")
