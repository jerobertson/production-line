class Recipe {
    constructor(result, ingredients, cost = 0) {
        this.result = result;
        this.ingredients = ingredients;
        this.cost = cost;
    }
}

function RecipeFactory(result) {
    switch (result) {
        case "Aluminium":
            return new Recipe("Aluminium", {}, 5);
        case "Aluminium Coil":
            return new Recipe("Aluminium Coil", {"Aluminium": 1});
        case "Aluminium Plate":
            return new Recipe("Aluminium Plate", {"Aluminium": 2});
        case "Coal":
            return new Recipe("Coal", {}, 5);
        case "Copper":
            return new Recipe("Copper", {}, 5);
        case "Copper Coil":
            return new Recipe("Copper Coil", {"Copper": 1});
        case "Copper Plate":
            return new Recipe("Copper Plate", {"Copper": 2});
        case "Gold":
            return new Recipe("Gold", {}, 5);
        case "Gold Coil":
            return new Recipe("Gold Coil", {"Gold": 1});
        case "Gold Plate":
            return new Recipe("Gold Plate", {"Gold": 2});
        case "Iron":
            return new Recipe("Iron", {}, 5);
        case "Iron Coil":
            return new Recipe("Iron Coil", {"Iron": 1});
        case "Iron Plate":
            return new Recipe("Iron Plate", {"Iron": 2});
        case "Lead":
            return new Recipe("Lead", {}, 5);
        case "Lead Coil":
            return new Recipe("Lead Coil", {"Lead": 1});
        case "Lead Plate":
            return new Recipe("Lead Plate", {"Lead": 2});
        case "Silver":
            return new Recipe("Silver", {}, 5);
        case "Silver Coil":
            return new Recipe("Silver Coil", {"Silver": 1});
        case "Silver Plate":
            return new Recipe("Silver Plate", {"Silver": 2});
        case "Tin":
            return new Recipe("Tin", {}, 5);
        case "Tin Coil":
            return new Recipe("Tin Coil", {"Tin": 1});
        case "Tin Plate":
            return new Recipe("Tin Plate", {"Tin": 2});
        case "Zinc":
            return new Recipe("Zinc", {}, 5);
        case "Zinc Coil":
            return new Recipe("Zinc Coil", {"Zinc": 1});
        case "Zinc Plate":
            return new Recipe("Zinc Plate", {"Zinc": 2});
        case "Brass":
            return new Recipe("Brass", {"Copper": 1, "Zinc": 1});
        case "Brass Coil":
            return new Recipe("Brass Coil", {"Brass": 1});
        case "Brass Plate":
            return new Recipe("Brass Plate", {"Brass": 2});
        case "Bronze":
            return new Recipe("Bronze", {"Copper": 1, "Tin": 1});
        case "Bronze Coil":
            return new Recipe("Bronze Coil", {"Bronze": 1});
        case "Bronze Plate":
            return new Recipe("Bronze Plate", {"Bronze": 2});
        case "Electrum":
            return new Recipe("Electrum", {"Gold": 1, "Silver": 1});
        case "Electrum Coil":
            return new Recipe("Electrum Coil", {"Electrum": 1});
        case "Electrum Plate":
            return new Recipe("Electrum Plate", {"Electrum": 2});
        case "Solder":
            return new Recipe("Solder", {"Tin": 1, "Lead": 1});
        case "Solder Coil":
            return new Recipe("Solder Coil", {"Solder": 1});
        case "Solder Plate":
            return new Recipe("Solder Plate", {"Solder": 2});
        case "Steel":
            return new Recipe("Steel", {"Iron": 1, "Coal": 1});
        case "Steel Coil":
            return new Recipe("Steel Coil", {"Steel": 1});
        case "Steel Plate":
            return new Recipe("Steel Plate", {"Steel": 2});
        case "":
            return null;
        default:
            throw "Invalid recipe name!";
    }
}