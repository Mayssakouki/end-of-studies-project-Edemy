from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from sentence_transformers import SentenceTransformer, util
import torch
import re

# Initialisation Flask
app = Flask(__name__)
CORS(app, resources={r"/recommend/*": {"origins": "http://localhost:5173"}})

# Connexion MongoDB
MONGO_URI = "mongodb+srv://mayssakouki00:GB3FsWEeQSoXhNQD@cluster0.a2p4t.mongodb.net/lms"
client = MongoClient(MONGO_URI)
db = client['lms']
courses_collection = db['courses']
quiz_results_collection = db['quizresults']

# Chargement du modèle BERT
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

# Nettoyer le texte HTML
def clean_html(raw_html):
    return re.sub('<[^<]+?>', '', raw_html)

# Préparer les textes des cours
def preprocess_course(course):
    return ' '.join([
        course.get('courseTitle', ''),
        course.get('subTitle', ''),
        course.get('courseLevel', ''),
        clean_html(course.get('description', ''))
    ]).lower()

@app.route('/recommend/<course_id>', methods=['GET'])
def recommend(course_id):
    try:
        object_id = ObjectId(course_id)
    except:
        return jsonify({'error': 'Invalid course ID'}), 400

    # Récupérer l'ID de l'utilisateur depuis les paramètres de la requête
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    try:
        user_object_id = ObjectId(user_id)
    except:
        return jsonify({'error': 'Invalid user ID'}), 400

    # Récupérer tous les cours publiés
    all_courses = list(courses_collection.find({"isPublished": True}))
    current_course = next((c for c in all_courses if c['_id'] == object_id), None)

    if not current_course:
        return jsonify({'error': 'Course not found'}), 404

    # Récupérer le dernier résultat de quiz pour ce cours et utilisateur
    latest_quiz_result = quiz_results_collection.find_one(
        {"userId": user_object_id, "courseId": object_id},
        sort=[("submittedAt", -1)]
    )

    # Déterminer si l'utilisateur a échoué ou réussi
    recommend_same_category = False
    if latest_quiz_result and not latest_quiz_result.get('passed', False):
        recommend_same_category = True  # Échec : recommander la même catégorie

    # Préparer l'embedding du cours actuel
    current_text = preprocess_course(current_course)
    current_embedding = model.encode(current_text, convert_to_tensor=True)

    results = []

    for course in all_courses:
        if course['_id'] == object_id:
            continue

        # Filtrer selon la catégorie
        if recommend_same_category:
            if course.get('category') != current_course.get('category'):
                continue  # Exclure les cours d'autres catégories si échec
        else:
            if course.get('category') == current_course.get('category'):
                continue  # Exclure les cours de la même catégorie si réussite

        course_text = preprocess_course(course)
        course_embedding = model.encode(course_text, convert_to_tensor=True)
        similarity = util.cos_sim(current_embedding, course_embedding).item()

        results.append({
            'id': str(course['_id']),
            'title': course.get('courseTitle'),
            'category': course.get('category'),
            'level': course.get('courseLevel'),
            'similarity': round(similarity, 3)
        })

    # Trier par similarité
    sorted_results = sorted(results, key=lambda x: x['similarity'], reverse=True)

    # Retourner les 3 premiers résultats
    return jsonify(sorted_results[:3])

if __name__ == '__main__':
    app.run(port=5002, debug=True)