itemMultipliers = [1, 2, 4, 10, 20, 100];

class Item {
    constructor(name, level = 0, ingredients = null) {
        this.name = name;
        this.level = level;
        this.ingredients = ingredients;
    }

    get value() {
        if (this.ingredients == null) return 100 * itemMultipliers[this.level];
        
        return this.ingredientCount * this.machineCount * itemMultipliers[this.level] *  110; // (100 * 1.1);
    }

    get ingredientCount() {
        if (this.ingredients == null) return 1;
        
        var ingredientCount = 0;
        for (var key in this.ingredients) {
            if (this.ingredients.hasOwnProperty(key)) {
                ingredientCount += (ItemFactory(key).ingredientCount * this.ingredients[key]);
            }
        }

        return ingredientCount;
    }

    get machineCount() {
        if (this.ingredients == null) return 1;

        var machineCount = 1;
        for (var key in this.ingredients) {
            if (this.ingredients.hasOwnProperty(key)) {
                machineCount += ItemFactory(key).machineCount;
            }
        }

        return machineCount;
    }

    get recipeHtml() {
        var head = `<div class="row justify-content-center align-items-center">
        <div class="container">
            <div class="row justify-content-center align-items-center mb-2">
                <div class="col-auto text-center">
                    <h5>` + this.name + `</h5>
                </div>
            </div>`;

        var foot = `</div>
        </div>`;

        if (this.ingredients == null) return head + foot;

        head += `<div class="row justify-content-center align-items-center mb-2">`;
        foot += `</div>`;
        for (var key in this.ingredients) {
            if (this.ingredients.hasOwnProperty(key)) {
                head += `<div class="col-auto text-center">
                    <div class="container">
                        <div class="row text-center">
                            <div class="col-12 text-center">
                                ` + key + `
                            </div>
                        </div>
                        <div class="row text-center">
                            <div class="col-12 text-center">
                                <img src="img/items/` + key + `.svg" width="64px" height="64px"/>
                            </div>
                        </div>
                        <div class="row text-center">
                            <div class="col-12 text-center">
                                x` + this.ingredients[key] + `
                            </div>
                        </div>
                    </div>
                </div>`;
            }
        }
        return head + foot;
    }
}

class ItemAnimation {
    constructor(items, x, y, dir) {
        this.items = items;
        this.x = x;
        this.y = y;
        if (!directions.includes(dir)) throw "Invalid direction!"
        this.dir = dir;
    }
}

function ItemFactory(name) {
    switch (name) {
        case "13 Nails":
            return new Item(name, 0, {"Iron Coil": 13});
        case "Aluminium":
            return new Item(name, 0);
        case "Aluminium Coil":
            return new Item(name, 0, {"Aluminium": 1});
        case "Aluminium Plate":
            return new Item(name, 0, {"Aluminium": 2});
        case "Battery":
            return new Item(name, 0, {"Lead Coil": 2, "Zinc Plate": 1});
        case "Bracelet":
            return new Item(name, 0, {"Silver Coil": 2});
        case "Car":
            return new Item(name, 0, {"Battery": 1, "Engine": 1, "Chassis": 1, "Frame": 2});
        case "Chassis":
            return new Item(name, 0, {"Aluminium Plate": 2});
        case "Chip":
            return new Item(name, 0, {"Copper Coil": 2, "Silver": 1});
        case "Container":
            return new Item(name, 0, {"Iron Plate": 4});
        case "Copper":
            return new Item(name, 0);
        case "Copper Coil":
            return new Item(name, 0, {"Copper": 1});
        case "Copper Plate":
            return new Item(name, 0, {"Copper": 2});
        case "Engine":
            return new Item(name, 0, {"Gear": 2, "Frame": 1});
        case "Foil":
            return new Item(name, 0, {"Aluminium Coil": 2});
        case "Frame":
            return new Item(name, 0, {"Iron": 4});
        case "Gear":
            return new Item(name, 0, {"Copper Plate": 1});
        case "Heat Exchanger":
            return new Item(name, 0, {"Aluminium Plate": 1, "Copper Coil": 1});
        case "Iron":
            return new Item(name, 0);
        case "Iron Coil":
            return new Item(name, 0, {"Iron": 1});
        case "Iron Plate":
            return new Item(name, 0, {"Iron": 2});
        case "Lead":
            return new Item(name, 0);
        case "Lead Coil":
            return new Item(name, 0, {"Lead": 1});
        case "Lead Plate":
            return new Item(name, 0, {"Lead": 2});
        case "Microchip":
            return new Item(name, 0, {"Chip": 1, "Zinc Coil": 1});
        case "Necklace":
            return new Item(name, 0, {"Gold Coil": 3});
        case "Silver":
            return new Item(name, 0);
        case "Silver Coil":
            return new Item(name, 0, {"Silver": 1});
        case "Silver Plate":
            return new Item(name, 0, {"Silver": 2});
        case "Zinc":
            return new Item(name, 0);
        case "Zinc Coil":
            return new Item(name, 0, {"Zinc": 1});
        case "Zinc Plate":
            return new Item(name, 0, {"Zinc": 2});
        case "":
            return null;
        default:
            throw "Invalid item name '" + name + "'!";
    }
}