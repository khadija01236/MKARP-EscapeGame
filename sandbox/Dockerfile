# Image de base ultra légère
FROM python:3.9-slim

# Installation de pytest pour les tests unitaires
RUN pip install pytest

# Dossier de travail dans le conteneur
WORKDIR /app

# On ne copie rien pour l'instant, le code sera injecté au lancement
CMD ["pytest", "test_script.py"]