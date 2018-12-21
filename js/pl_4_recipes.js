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
        case "Coal":
            return new Recipe("Coal", {}, 5);
        case "Copper":
            return new Recipe("Copper", {}, 5);
        case "Gold":
            return new Recipe("Gold", {}, 5);
        case "Iron":
            return new Recipe("Iron", {}, 5);
        case "Lead":
            return new Recipe("Lead", {}, 5);
        case "Silver":
            return new Recipe("Silver", {}, 5);
        case "Tin":
            return new Recipe("Tin", {}, 5);
        case "Zinc":
            return new Recipe("Zinc", {}, 5);
        case "Brass":
            return new Recipe("Brass", {"Copper": 1, "Zinc": 1})
        case "Bronze":
            return new Recipe("Bronze", {"Copper": 1, "Tin": 1})
        case "Electrum":
            return new Recipe("Electrum", {"Gold": 1, "Silver": 1})
        case "Solder":
            return new Recipe("Solder", {"Tin": 1, "Lead": 1})
        case "Steel":
            return new Recipe("Steel", {"Iron": 1, "Coal": 1})
        case "":
            return null;
        default:
            throw "Invalid recipe name!";
    }
}