class Item {
    constructor(name, colour) {
        this.name = name;
        this.colour = colour;
    }

    getName() {
        return this.name;
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
        case "Aluminium":
            return new Item("Aluminium", "#d2d9db");
        case "Coal":
            return new Item("Coal", "#2c2b1e");
        case "Copper":
            return new Item("Copper", "#d8712d");
        case "Gold":
            return new Item("Gold", "#ffe91d");
        case "Iron":
            return new Item("Iron", "#44291c");
        case "Lead":
            return new Item("Lead", "#372733");
        case "Silver":
            return new Item("Silver", "#eaecff");
        case "Tin":
            return new Item("Tin", "#796e6b");
        case "Zinc":
            return new Item("Zinc", "#575888");
        case "Brass":
            return new Item("Brass", "#ecae58");
        case "Bronze":
            return new Item("Bronze", "#6f5530");
        case "Electrum":
            return new Item("Electrum", "#d8bb78");
        case "Solder":
            return new Item("Solder", "#2c3a2a");
        case "Steel":
            return new Item("Steel", "#b6a9a6");
        case "":
            return null;
        default:
            throw "Invalid item name!";
    }
}