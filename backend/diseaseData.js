const diseaseData = {
    "Apple___Apple_scab": {
        description: "Apple scab is a fungal disease that causes dark, scabby lesions on leaves, fruit, and twigs, often leading to premature leaf drop.",
        precautions: [
            "Rake and destroy fallen leaves to reduce fungal spores.",
            "Prune trees to ensure good air circulation and sunlight penetration.",
            "Apply a preventative fungicide spray schedule in early spring."
        ]
    },
    "Apple___Black_rot": {
        description: "Black rot is a fungal disease characterized by frogeye leaf spots, cankers on branches, and rotting, mummified fruit.",
        precautions: [
            "Prune out and destroy infected dead wood and cankers during winter.",
            "Remove all mummified fruit from the tree and ground.",
            "Apply captan or copper-based fungicides starting at the delayed dormant stage."
        ]
    },
    "Apple___Cedar_apple_rust": {
        description: "A fungal disease that requires both apple and cedar trees to complete its life cycle, causing bright orange or yellow spots on leaves.",
        precautions: [
            "Remove nearby eastern red cedar trees if possible, as they host the fungus.",
            "Plant rust-resistant apple varieties.",
            "Apply protective fungicides when apple blossoms first open."
        ]
    },
    "Apple___healthy": {
        description: "Your apple tree leaves look completely healthy!",
        precautions: [
            "Maintain an annual dormant pruning schedule.",
            "Ensure steady watering during dry spells to prevent fruit drop.",
            "Keep the base of the tree clear of weeds and heavy mulch."
        ]
    },
    "Blueberry___healthy": {
        description: "Your blueberry plant looks completely healthy!",
        precautions: [
            "Maintain acidic soil (pH between 4.5 and 5.5).",
            "Apply a layer of pine bark mulch to retain moisture.",
            "Ensure the plant gets 1-2 inches of water per week."
        ]
    },
    "Cherry_(including_sour)___Powdery_mildew": {
        description: "A fungal infection that leaves a white, powdery coating on leaves and stems, eventually causing them to curl and distort.",
        precautions: [
            "Ensure proper spacing between trees for maximum air flow.",
            "Avoid excessive nitrogen fertilizer, which encourages lush, susceptible growth.",
            "Apply sulfur-based fungicides or neem oil at the first sign of mildew."
        ]
    },
    "Cherry_(including_sour)___healthy": {
        description: "Your cherry tree looks completely healthy!",
        precautions: [
            "Prune annually in late winter to maintain an open canopy.",
            "Apply a balanced fertilizer in early spring before blooming.",
            "Monitor for common pests like aphids and cherry fruit flies."
        ]
    },
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
        description: "A fungal disease causing long, rectangular, gray-to-tan lesions on corn leaves that restrict the plant's ability to photosynthesize.",
        precautions: [
            "Practice crop rotation to prevent the fungus from surviving in the soil.",
            "Use conventional tillage to bury infected crop residue.",
            "Plant resistant corn hybrids in the next growing season."
        ]
    },
    "Corn_(maize)___Common_rust_": {
        description: "A fungal disease that forms raised, brick-red pustules on both upper and lower leaf surfaces, drawing nutrients away from the ear.",
        precautions: [
            "Plant rust-resistant corn varieties.",
            "Apply a foliar fungicide if symptoms appear early in the season.",
            "Ensure plants are adequately spaced to reduce humidity in the canopy."
        ]
    },
    "Corn_(maize)___Northern_Leaf_Blight": {
        description: "A fungal disease characterized by large, cigar-shaped grayish-green to tan lesions on the lower leaves.",
        precautions: [
            "Select and plant resistant hybrids.",
            "Plow under infected crop residue after harvest.",
            "Apply fungicides early if weather conditions are cool and wet."
        ]
    },
    "Corn_(maize)___healthy": {
        description: "Your corn plant looks completely healthy!",
        precautions: [
            "Ensure deep, infrequent watering to encourage strong root systems.",
            "Apply nitrogen fertilizer when plants are knee-high.",
            "Keep the area free of weeds that compete for nutrients."
        ]
    },
    "Grape___Black_rot": {
        description: "A devastating fungal disease that attacks all green parts of the vine, causing grapes to shrivel into hard, black mummies.",
        precautions: [
            "Remove and destroy all mummified grapes and infected canes during winter pruning.",
            "Keep the vine canopy open by removing excess leaves to allow rapid drying.",
            "Apply fungicides continuously from early shoot growth until the grapes begin to color."
        ]
    },
    "Grape___Esca_(Black_Measles)": {
        description: "A complex wood disease caused by various fungi, leading to 'tiger-stripe' patterns on leaves and dark spotting on the berries.",
        precautions: [
            "Avoid pruning during wet weather when spores are actively spreading.",
            "Identify and prune out infected wood down to healthy tissue.",
            "Apply pruning wound protectants immediately after making large cuts."
        ]
    },
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
        description: "A fungal disease causing irregular, dark brown lesions on the leaves, which can lead to premature defoliation.",
        precautions: [
            "Rake and burn fallen leaves to reduce overwintering spores.",
            "Ensure proper vine spacing and canopy management for airflow.",
            "Apply protective copper-based fungicides during wet spring weather."
        ]
    },
    "Grape___healthy": {
        description: "Your grapevine looks completely healthy!",
        precautions: [
            "Continue routine canopy thinning to ensure sunlight reaches the fruit.",
            "Water deeply at the roots rather than using overhead sprinklers.",
            "Monitor regularly for signs of Japanese beetles or aphids."
        ]
    },
    "Orange___Haunglongbing_(Citrus_greening)": {
        description: "A fatal bacterial disease spread by the Asian citrus psyllid. It causes mottled yellow leaves and bitter, misshapen, green fruit.",
        precautions: [
            "There is no cure; infected trees must be removed and destroyed immediately to save surrounding trees.",
            "Control the Asian citrus psyllid population using targeted insecticides.",
            "Always purchase certified disease-free trees from reputable nurseries."
        ]
    },
    "Peach___Bacterial_spot": {
        description: "A bacterial disease that causes severe defoliation, leaving 'shot-holes' in the leaves and deep, cracked blemishes on the fruit.",
        precautions: [
            "Plant resistant peach varieties if you live in a warm, wet climate.",
            "Apply copper-based bactericides in the fall when leaves are dropping.",
            "Maintain overall tree health through proper fertilization and watering."
        ]
    },
    "Peach___healthy": {
        description: "Your peach tree looks completely healthy!",
        precautions: [
            "Prune the tree into an open-center 'V' shape to maximize sunlight.",
            "Thin out young fruit to prevent branches from breaking under heavy loads.",
            "Apply a dormant oil spray in late winter to suffocate overwintering pests."
        ]
    },
    "Pepper,_bell___Bacterial_spot": {
        description: "A highly destructive bacterial disease causing dark, water-soaked spots on leaves and scabby lesions on the peppers.",
        precautions: [
            "Purchase certified disease-free seeds and transplants.",
            "Avoid overhead watering; use drip irrigation to keep foliage dry.",
            "Apply copper fungicides mixed with mancozeb at the first sign of spots."
        ]
    },
    "Pepper,_bell___healthy": {
        description: "Your bell pepper plant looks completely healthy!",
        precautions: [
            "Provide 1-2 inches of water per week, ensuring consistent soil moisture.",
            "Mulch around the base of the plant to retain moisture and regulate soil temperature.",
            "Support the plant with a small cage or stake as fruit develops."
        ]
    },
    "Potato___Early_blight": {
        description: "A fungal disease characterized by dark, concentric 'target-like' rings on older leaves, causing them to turn yellow and drop.",
        precautions: [
            "Rotate crops; do not plant potatoes or tomatoes in the same spot consecutively.",
            "Remove infected lower leaves to slow the upward spread.",
            "Apply chlorothalonil or copper-based fungicides when weather is warm and humid."
        ]
    },
    "Potato___Late_blight": {
        description: "A fast-spreading, destructive water mold causing large, dark, water-soaked lesions on leaves and rotting the tubers underground.",
        precautions: [
            "Destroy infected plants immediately; do not compost them.",
            "Hill up soil around the base of the plant to protect tubers from spores washing down.",
            "Apply preventative fungicides specifically rated for late blight during wet, cool weather."
        ]
    },
    "Potato___healthy": {
        description: "Your potato plant looks completely healthy!",
        precautions: [
            "Continue to 'hill' soil around the stems to encourage more tuber growth.",
            "Ensure the soil remains consistently moist but not waterlogged.",
            "Watch for the Colorado Potato Beetle and remove them by hand if spotted."
        ]
    },
    "Raspberry___healthy": {
        description: "Your raspberry plant looks completely healthy!",
        precautions: [
            "Prune out old, dead canes immediately after harvesting.",
            "Keep the row width narrow (about 1-2 feet) to ensure good airflow.",
            "Ensure the plants receive at least an inch of water weekly during fruit development."
        ]
    },
    "Soybean___healthy": {
        description: "Your soybean plant looks completely healthy!",
        precautions: [
            "Ensure soil has proper inoculation with Rhizobium bacteria for nitrogen fixation.",
            "Keep the field weed-free, especially during the first 4-6 weeks of growth.",
            "Monitor for common pests like soybean aphids and spider mites."
        ]
    },
    "Squash___Powdery_mildew": {
        description: "A common fungal disease that coats the leaves in a white, powdery dust, eventually causing them to turn brown and shrivel.",
        precautions: [
            "Plant resistant squash varieties whenever possible.",
            "Space plants widely to allow for excellent air circulation and sunlight.",
            "Spray with neem oil, potassium bicarbonate, or sulfur early in the infection."
        ]
    },
    "Strawberry___Leaf_scorch": {
        description: "A fungal disease causing irregular, purplish-brown spots on leaves. As the disease progresses, the leaves appear burned or scorched.",
        precautions: [
            "Remove and destroy severely infected leaves and plant debris.",
            "Ensure plants are situated in full sun with good soil drainage.",
            "Avoid overhead irrigation to keep the leaf surfaces dry."
        ]
    },
    "Strawberry___healthy": {
        description: "Your strawberry plant looks completely healthy!",
        precautions: [
            "Renew the strawberry bed every 3-4 years to maintain high yields.",
            "Use straw mulch under the plants to keep berries off the bare soil.",
            "Water regularly, providing about 1-2 inches per week."
        ]
    },
    "Tomato___Bacterial_spot": {
        description: "A bacterial infection causing small, water-soaked, greasy spots on leaves and raised, scabby spots on the fruit.",
        precautions: [
            "Do not work in the tomato patch when the plants are wet to avoid spreading bacteria.",
            "Remove heavily infected leaves and destroy them.",
            "Apply a copper-based bactericide to slow the spread."
        ]
    },
    "Tomato___Early_blight": {
        description: "A fungal disease that causes brown spots with concentric rings (like a target) primarily on the lower, older leaves.",
        precautions: [
            "Prune lower branches to keep foliage off the soil.",
            "Water the soil at the base, not the leaves, to keep foliage dry.",
            "Apply copper-based or chlorothalonil fungicides at the first sign of disease."
        ]
    },
    "Tomato___Late_blight": {
        description: "A highly destructive disease causing rapid development of dark, water-soaked spots on leaves and dark lesions on stems.",
        precautions: [
            "Destroy infected plants immediately—do not compost them.",
            "Ensure excellent drainage and avoid overhead watering entirely.",
            "Use protective fungicides before the infection spreads to the rest of the crop."
        ]
    },
    "Tomato___Leaf_Mold": {
        description: "A fungal disease that thrives in high humidity, causing pale green or yellow spots on the upper leaf and an olive-green mold on the underside.",
        precautions: [
            "Improve air circulation by pruning and staking the plants.",
            "Reduce humidity around the plant by watering early in the day.",
            "Apply a suitable fungicide formulated for leaf mold."
        ]
    },
    "Tomato___Septoria_leaf_spot": {
        description: "A very common fungal disease causing numerous small, circular spots with dark borders and gray centers on the lower leaves.",
        precautions: [
            "Remove and destroy the infected lower leaves immediately.",
            "Apply a thick layer of mulch to prevent soil-borne spores from splashing up.",
            "Treat with a fungicidal spray containing chlorothalonil or copper."
        ]
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        description: "Tiny arachnids that feed on the sap of the plant, causing leaves to look stippled, yellow, and covered in fine webbing.",
        precautions: [
            "Spray the plant forcefully with water to dislodge the mites and destroy their webs.",
            "Introduce natural predators like ladybugs or predatory mites.",
            "Apply neem oil or insecticidal soap, ensuring you coat the undersides of the leaves."
        ]
    },
    "Tomato___Target_Spot": {
        description: "A fungal disease causing small, pinpoint lesions that enlarge into target-like circles on leaves, eventually causing defoliation.",
        precautions: [
            "Ensure adequate spacing between plants for maximum air flow.",
            "Avoid overhead watering and apply mulch to block splashing soil.",
            "Apply targeted fungicides when weather conditions are warm and highly humid."
        ]
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        description: "A viral disease transmitted by whiteflies. It causes stunted growth, severely cupped or curled leaves, and a halt in fruit production.",
        precautions: [
            "Infected plants cannot be cured and must be uprooted and destroyed immediately.",
            "Control the whitefly population using yellow sticky traps and insecticidal soap.",
            "Plant resistant tomato varieties in the future."
        ]
    },
    "Tomato___Tomato_mosaic_virus": {
        description: "A highly contagious virus causing mottled light and dark green patterns on leaves, stunted growth, and reduced yield.",
        precautions: [
            "There is no cure; remove and destroy the infected plant to protect others.",
            "Thoroughly wash your hands and disinfect all gardening tools after handling the plant.",
            "Avoid using tobacco products near the plants, as the virus can be transmitted from them."
        ]
    },
    "Tomato___healthy": {
        description: "Your tomato plant looks completely healthy!",
        precautions: [
            "Continue regular watering at the base of the plant to prevent blossom end rot.",
            "Ensure the plant gets 6-8 hours of direct sunlight daily.",
            "Maintain a regular organic fertilizer schedule, focusing on phosphorus and potassium."
        ]
    }
};

export default diseaseData;