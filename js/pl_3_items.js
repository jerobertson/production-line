itemMultipliers = [1, 2, 4, 10, 20, 100];

class Item {
    constructor(name, level = 0, producer = "", ingredients = null) {
        this.name = name;
        this.level = level;
        this.producer = producer;
        this.ingredients = ingredients;
    }

    get value() {
        if (this.ingredients == null) return 100 * itemMultipliers[this.level];
        
        return this.ingredientCount * this.machineCount * itemMultipliers[this.level] *  150; // (100 * 1.5);
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
        var head = `<div class="row justify-content-center align-items-center mb-2">
            <div class="container m-2 p-2" style="background: #8b8b8b8b">
                <!--<div class="row justify-content-center align-items-center">
                    <div class="col-auto text-center">
                        <h5>` + this.name + `</h5>
                    </div>
                </div>-->`;

        var foot = `</div>
        </div>`;

        if (this.ingredients == null && this.producer == "") return head + foot;

        head += `<div class="row justify-content-center align-items-center">`;
        foot += `</div>`;

        if (this.producer != "") {
            head += `<div class="col-auto text-center">
                <div class="container">
                    <div class="row text-center">
                        <div class="col-12 text-center">
                            ` + this.producer + `
                        </div>
                    </div>
                    <div class="row text-center">
                        <div class="col-12 text-center">
                            <img src="img/tiles/` + this.producer + `/` + this.level + `.svg" width="64px" height="64px"/>
                        </div>
                    </div>
                    <div class="row text-center">
                        <div class="col-12 text-center">
                            Lvl. ` + (this.level + 1) + `
                        </div>
                    </div>
                </div>
            </div>`;
        }

        if (this.ingredients == null) {
            head += `<div class="col-auto text-center p-0">
                <div class="container p-0">
                    <div class="row text-center p-0">
                        <div class="col-12 text-center p-0">
                            =
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-auto text-center">
                <div class="container">
                    <div class="row text-center">
                        <div class="col-12 text-center">
                            ` + this.name + `
                        </div>
                    </div>
                    <div class="row text-center">
                        <div class="col-12 text-center">
                            <img src="img/items/` + this.name + `.svg" width="64px" height="64px"/>
                        </div>
                    </div>
                    <div class="row text-center">
                        <div class="col-12 text-center">
                            &pound;` + this.value.toLocaleString("en-GB", {maximumFractionDigits: 0}) + `
                        </div>
                    </div>
                </div>
            </div>`;

            return head + foot;
        }

        head += `<div class="col-auto text-center p-0">
            <div class="container p-0">
                <div class="row text-center p-0">
                    <div class="col-12 text-center p-0">
                        +
                    </div>
                </div>
            </div>
        </div>`;

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

        head += `<div class="col-auto text-center p-0">
            <div class="container p-0">
                <div class="row text-center p-0">
                    <div class="col-12 text-center p-0">
                        =
                    </div>
                </div>
            </div>
        </div>
        <div class="col-auto text-center">
            <div class="container">
                <div class="row text-center">
                    <div class="col-12 text-center">
                        ` + this.name + `
                    </div>
                </div>
                <div class="row text-center">
                    <div class="col-12 text-center">
                        <img src="img/items/` + this.name + `.svg" width="64px" height="64px"/>
                    </div>
                </div>
                <div class="row text-center">
                    <div class="col-12 text-center">
                        &pound;` + this.value.toLocaleString("en-GB", {maximumFractionDigits: 0}) + `
                    </div>
                </div>
            </div>
        </div>`;

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
            return new Item(name, 0, "Assembler", {"Iron Coil": 13});
        case "Aluminium":
            return new Item(name, 0, "Importer");
        case "Aluminium Coil":
            return new Item(name, 0, "Drawer", {"Aluminium": 1});
        case "Aluminium Plate":
            return new Item(name, 0, "Press", {"Aluminium": 2});
        case "Battery":
            return new Item(name, 0, "Assembler", {"Lead Coil": 2, "Zinc Plate": 1});
        case "Bracelet":
            return new Item(name, 0, "Assembler", {"Silver Coil": 2});
        case "Car":
            return new Item(name, 0, "Assembler", {"Battery": 1, "Engine": 1, "Chassis": 1, "Frame": 2});
        case "Chassis":
            return new Item(name, 0, "Assembler", {"Aluminium Plate": 2});
        case "Chip":
            return new Item(name, 0, "Assembler", {"Copper Coil": 2, "Silver": 1});
        case "Container":
            return new Item(name, 0, "Assembler", {"Iron Plate": 4});
        case "Copper":
            return new Item(name, 0, "Importer");
        case "Copper Coil":
            return new Item(name, 0, "Drawer", {"Copper": 1});
        case "Copper Plate":
            return new Item(name, 0, "Press", {"Copper": 2});
        case "Engine":
            return new Item(name, 0, "Assembler", {"Gear": 2, "Frame": 1});
        case "Foil":
            return new Item(name, 0, "Assembler", {"Aluminium Coil": 2});
        case "Frame":
            return new Item(name, 0, "Assembler", {"Iron": 4});
        case "Gear":
            return new Item(name, 0, "Assembler", {"Copper Plate": 1});
        case "Heat Exchanger":
            return new Item(name, 0, "Assembler", {"Aluminium Plate": 1, "Copper Coil": 1});
        case "Iron":
            return new Item(name, 0, "Importer");
        case "Iron Coil":
            return new Item(name, 0, "Drawer", {"Iron": 1});
        case "Iron Plate":
            return new Item(name, 0, "Press", {"Iron": 2});
        case "Lead":
            return new Item(name, 0, "Importer");
        case "Lead Coil":
            return new Item(name, 0, "Drawer", {"Lead": 1});
        case "Lead Plate":
            return new Item(name, 0, "Press", {"Lead": 2});
        case "Microchip":
            return new Item(name, 0, "Assembler", {"Chip": 1, "Zinc Coil": 1});
        case "Silver":
            return new Item(name, 0, "Importer");
        case "Silver Coil":
            return new Item(name, 0, "Drawer", {"Silver": 1});
        case "Silver Plate":
            return new Item(name, 0, "Press", {"Silver": 2});
        case "Zinc":
            return new Item(name, 0, "Importer");
        case "Zinc Coil":
            return new Item(name, 0, "Drawer", {"Zinc": 1});
        case "Zinc Plate":
            return new Item(name, 0, "Press", {"Zinc": 2});

        case "13 Hot Nails":
            return new Item(name, 1, "Furnace", {"13 Nails": 1, "Coal": 1});
        case "Box of Infinite Unsettling Possibilities":
            return new Item(name, 1, "Assembler", {"13 Hot Nails": 1, "Container": 1});
        case "Brass":
            return new Item(name, 1, "Furnace", {"Copper": 1, "Zinc": 1});
        case "Brass Coil":
            return new Item(name, 1, "Drawer", {"Brass": 1});
        case "Brass Plate":
            return new Item(name, 1, "Press", {"Brass": 2});
        case "Bronze":
            return new Item(name, 1, "Furnace", {"Copper": 1, "Tin": 1});
        case "Bronze Coil":
            return new Item(name, 1, "Drawer", {"Tin": 1});
        case "Bronze Plate":
            return new Item(name, 1, "Press", {"Tin": 2});
        case "Coal":
            return new Item(name, 1, "Importer");
        case "Electrum":
            return new Item(name, 1, "Furnace", {"Gold": 1, "Silver": 1});
        case "Electrum Coil":
            return new Item(name, 1, "Drawer", {"Electrum": 1});
        case "Electrum Plate":
            return new Item(name, 1, "Press", {"Electrum": 2});
        case "Glass":
            return new Item(name, 1, "Furnace", {"Lead": 2});
        case "Glass Pane":
            return new Item(name, 1, "Furnace", {"Glass": 1, "Tin Plate": 1});
        case "Gold":
            return new Item(name, 1, "Importer");
        case "Gold Coil":
            return new Item(name, 1, "Drawer", {"Gold": 1});
        case "Gold Plate":
            return new Item(name, 1, "Press", {"Gold": 2});
        case "Mirror":
            return new Item(name, 1, "Assembler", {"Glass Pane": 1, "Silver": 1});
        case "Necklace":
            return new Item(name, 1, "Assembler", {"Gold Coil": 3});
        case "Silicon":
            return new Item(name, 1, "Importer");
        case "Solar Panel":
            return new Item(name, 1, "Assembler", {"Wafer": 4, "Silver Plate": 1, "Window": 1, "Frame": 1});
        case "Solder":
            return new Item(name, 1, "Importer");
        case "Solder Coil":
            return new Item(name, 1, "Drawer", {"Solder": 1});
        case "Solder Plate":
            return new Item(name, 1, "Press", {"Solder": 2});    
        case "Steel":
            return new Item(name, 1, "Importer");
        case "Steel Coil":
            return new Item(name, 1, "Drawer", {"Steel": 1});
        case "Steel Plate":
            return new Item(name, 1, "Press", {"Steel": 2});
        case "Tin":
            return new Item(name, 1, "Importer");
        case "Tin Coil":
            return new Item(name, 1, "Drawer", {"Tin": 1});
        case "Tin Plate":
            return new Item(name, 1, "Press", {"Tin": 2});
        case "Wafer":
            return new Item(name, 1, "Press", {"Silicon": 2});
        case "Window":
            return new Item(name, 1, "Assembler", {"Frame": 1, "Glass Pane": 1});
            
        case "":
            return null;
        default:
            throw "Invalid item name '" + name + "'!";
    }
}