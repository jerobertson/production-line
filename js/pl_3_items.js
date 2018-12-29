class Item {
    constructor(name, colour, value = 0) {
        this.name = name;
        this.colour = colour;
        this.value = value;
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
            return new Item("Aluminium", "#d2d9db", 50);
        case "Aluminium Coil":
            return new Item("Aluminium Coil", "", 200);
        case "Aluminium Plate":
            return new Item("Aluminium Plate", "", 500);
        case "Coal":
            return new Item("Coal", "#2c2b1e", 50);
        case "Copper":
            return new Item("Copper", "#d8712d", 50);
        case "Copper Coil":
            return new Item("Copper Coil", "", 200);
        case "Copper Plate":
            return new Item("Copper Plate", "", 500);
        case "Gold":
            return new Item("Gold", "#ffe91d", 50);
        case "Gold Coil":
            return new Item("Gold Coil", "", 200);
        case "Gold Plate":
            return new Item("Gold Plate", "", 500);
        case "Iron":
            return new Item("Iron", "#44291c", 50);
        case "Iron Coil":
            return new Item("Iron Coil", "", 200);
        case "Iron Plate":
            return new Item("Iron Plate", "", 500);
        case "Lead":
            return new Item("Lead", "#372733", 50);
        case "Lead Coil":
            return new Item("Lead Coil", "", 200);
        case "Lead Plate":
            return new Item("Lead Plate", "", 500);
        case "Silver":
            return new Item("Silver", "#eaecff", 50);
        case "Silver Coil":
            return new Item("Silver Coil", "", 200);
        case "Silver Plate":
            return new Item("Silver Plate", "", 500);
        case "Tin":
            return new Item("Tin", "#796e6b", 50);
        case "Tin Coil":
            return new Item("Tin Coil", "", 200);
        case "Tin Plate":
            return new Item("Tin Plate", "", 500);
        case "Zinc":
            return new Item("Zinc", "#575888", 50);
        case "Zinc Coil":
            return new Item("Zinc Coil", "", 200);
        case "Zinc Plate":
            return new Item("Zinc Plate", "", 500);
        case "Brass":
            return new Item("Brass", "#ecae58", 500);
        case "Brass Coil":
            return new Item("Brass Coil", "", 2000);
        case "Brass Plate":
            return new Item("Brass Plate", "", 5000);
        case "Bronze":
            return new Item("Bronze", "#6f5530", 500);
        case "Bronze Coil":
            return new Item("Bronze Coil", "", 2000);
        case "Bronze Plate":
            return new Item("Bronze Plate", "", 5000);
        case "Electrum":
            return new Item("Electrum", "#d8bb78", 500);
        case "Electrum Coil":
            return new Item("Electrum Coil", "", 2000);
        case "Electrum Plate":
            return new Item("Electrum Plate", "", 5000);
        case "Solder":
            return new Item("Solder", "#2c3a2a", 500);
        case "Solder Coil":
            return new Item("Solder Coil", "", 2000);
        case "Solder Plate":
            return new Item("Solder Plate", "", 5000);
        case "Steel":
            return new Item("Steel", "#b6a9a6", 500);
        case "Steel Coil":
            return new Item("Steel Coil", "", 2000);
        case "Steel Plate":
            return new Item("Steel Plate", "", 5000);
        case "":
            return null;
        default:
            throw "Invalid item name!";
    }
}