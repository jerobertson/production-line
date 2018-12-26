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
        case "Aluminium Coil":
            return new Item("Aluminium Coil", "");
        case "Aluminium Plate":
            return new Item("Aluminium Plate", "");
        case "Coal":
            return new Item("Coal", "#2c2b1e");
        case "Copper":
            return new Item("Copper", "#d8712d");
        case "Copper Coil":
            return new Item("Copper Coil", "");
        case "Copper Plate":
            return new Item("Copper Plate", "");
        case "Gold":
            return new Item("Gold", "#ffe91d");
        case "Gold Coil":
            return new Item("Gold Coil", "");
        case "Gold Plate":
            return new Item("Gold Plate", "");
        case "Iron":
            return new Item("Iron", "#44291c");
        case "Iron Coil":
            return new Item("Iron Coil", "");
        case "Iron Plate":
            return new Item("Iron Plate", "");
        case "Lead":
            return new Item("Lead", "#372733");
        case "Lead Coil":
            return new Item("Lead Coil", "");
        case "Lead Plate":
            return new Item("Lead Plate", "");
        case "Silver":
            return new Item("Silver", "#eaecff");
        case "Silver Coil":
            return new Item("Silver Coil", "");
        case "Silver Plate":
            return new Item("Silver Plate", "");
        case "Tin":
            return new Item("Tin", "#796e6b");
        case "Tin Coil":
            return new Item("Tin Coil", "");
        case "Tin Plate":
            return new Item("Tin Plate", "");
        case "Zinc":
            return new Item("Zinc", "#575888");
        case "Zinc Coil":
            return new Item("Zinc Coil", "");
        case "Zinc Plate":
            return new Item("Zinc Plate", "");
        case "Brass":
            return new Item("Brass", "#ecae58");
        case "Brass Coil":
            return new Item("Brass Coil", "");
        case "Brass Plate":
            return new Item("Brass Plate", "");
        case "Bronze":
            return new Item("Bronze", "#6f5530");
        case "Bronze Coil":
            return new Item("Bronze Coil", "");
        case "Bronze Plate":
            return new Item("Bronze Plate", "");
        case "Electrum":
            return new Item("Electrum", "#d8bb78");
        case "Electrum Coil":
            return new Item("Electrum Coil", "");
        case "Electrum Plate":
            return new Item("Electrum Plate", "");
        case "Solder":
            return new Item("Solder", "#2c3a2a");
        case "Solder Coil":
            return new Item("Solder Coil", "");
        case "Solder Plate":
            return new Item("Solder Plate", "");
        case "Steel":
            return new Item("Steel", "#b6a9a6");
        case "Steel Coil":
            return new Item("Steel Coil", "");
        case "Steel Plate":
            return new Item("Steel Plate", "");
        case "":
            return null;
        default:
            throw "Invalid item name!";
    }
}