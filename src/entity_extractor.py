import os
import re
import json
from pathlib import Path
from collections import Counter

DATASET_KEYWORDS = [
    "ImageNet", "CIFAR-10", "CIFAR-100", "MNIST", "COCO", "VOC", "Cityscapes",
    "IMDB", "SQuAD", "GLUE", "SuperGLUE", "WMT", "Penn Treebank",
    "MovieLens", "Netflix", "Kaggle", "UC Irvine", "UCI",
    "WordNet", "ConceptNet", "DBpedia", "Freebase",
    "LFW", "CelebA", "CASIA-WebFace", "MegaFace",
    "KITTI", "WAYMO", "nuScenes", "Apolloscape",
    "BERT", "RoBERTa", "GPT-2", "GPT-3", "T5", 
]

METHOD_KEYWORDS = [
    "CNN", "Convolutional Neural Network", "RNN", "Recurrent Neural Network",
    "LSTM", "Long Short-Term Memory", "GRU", "Gated Recurrent Unit",
    "Transformer", "Attention", "Self-Attention", "Multi-Head Attention",
    "ResNet", "Residual Network", "DenseNet", "VGG", "Inception", "Xception",
    "GAN", "Generative Adversarial Network", "VAE", "Variational Autoencoder",
    "BERT", "RoBERTa", "GPT", "T5", "BART", "XLNet",
    "Adam", "SGD", "RMSprop", "Adagrad", "Momentum",
    "Batch Normalization", "Layer Normalization", "Dropout",
    "Reinforcement Learning", "Q-Learning", "DQN", "PPO", "SAC",
    "Support Vector Machine", "SVM", "Random Forest", "Gradient Boosting", "XGBoost", "LightGBM",
    "K-Means", "PCA", "Principal Component Analysis", "t-SNE",
    "Backpropagation", "Gradient Descent", "Cross-Entropy", "Softmax",
    "U-Net", "YOLO", "SSD", "Mask R-CNN", "Faster R-CNN"
]

def extract_entities_from_text(text):
    text_lower = text.lower()
    
    datasets = []
    for ds in DATASET_KEYWORDS:
        if re.search(r'\b' + re.escape(ds.lower()) + r'\b', text_lower):
            datasets.append(ds)
            
    methods = []
    for method in METHOD_KEYWORDS:
        if re.search(r'\b' + re.escape(method.lower()) + r'\b', text_lower):
            methods.append(method)
            
    return {
        "datasets": datasets,
        "methods": methods
    }

def extract_and_save_entities(input_folder=os.path.join('outputs', 'extracted_text'), 
                              output_file=os.path.join('outputs', 'entities.json'),
                              current_papers=None):
    print("\nExtracting datasets, methods, and algorithms...")
    
    if not os.path.exists(input_folder):
        print(f"Input folder {input_folder} does not exist.")
        return {}


    target_names = set()
    if current_papers:
        for p in current_papers:
            if isinstance(p, dict) and 'title' in p:
                safe_title = p['title'].replace(" ", "_")
                safe_title = re.sub(r'[<>":\/\\|?*]', '', safe_title)
                safe_title = safe_title[:100].strip()
                target_names.add(safe_title)
            elif isinstance(p, str):
                target_names.add(p)
    
    all_extracted = {}
    aggregated_datasets = Counter()
    aggregated_methods = Counter()
    
    for text_file in os.listdir(input_folder):
        if text_file.endswith('.txt'):
            paper_name = text_file.replace('.txt', '')
            

            if target_names:
                matched = False
                if paper_name in target_names:
                    matched = True
                else:
                    for target in target_names:
                        if target in paper_name or paper_name in target:
                            matched = True
                            break
                if not matched:
                    continue

            text_path = os.path.join(input_folder, text_file)
            try:
                with open(text_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                entities = extract_entities_from_text(content)
                all_extracted[paper_name] = entities
                
                aggregated_datasets.update(entities['datasets'])
                aggregated_methods.update(entities['methods'])
                
            except Exception as e:
                print(f"Error processing {text_file}: {str(e)}")
                
    output_data = {
        "per_paper_entities": all_extracted,
        "common_entities": {
            "datasets": dict(aggregated_datasets.most_common()),
            "methods_and_algorithms": dict(aggregated_methods.most_common())
        }
    }
    
    Path(os.path.dirname(output_file)).mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2)
        
    print(f"Entity extraction completed. Saved to {output_file}")
    
    print("\nCommon Datasets Found:")
    for ds, count in aggregated_datasets.most_common(5):
        print(f" - {ds}: {count} papers")
        
    print("\nCommon Methods/Algorithms Found:")
    for method, count in aggregated_methods.most_common(10):
        print(f" - {method}: {count} papers")
        
    return output_data
if __name__ == "__main__":
    extract_and_save_entities()
