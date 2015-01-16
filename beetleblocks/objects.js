// THREE additions
THREE.Object3D.prototype.addLineToPointWithColor = function(point, color) {
	return this.addLineFromPointToPointWithColor(new THREE.Vector3(), point, color)
}

THREE.Object3D.prototype.addLineFromPointToPointWithColor = function(originPoint, destinationPoint, color) {
	geometry = new THREE.Geometry();
	geometry.vertices.push(originPoint);
	geometry.vertices.push(destinationPoint);
	var lineMaterial = new THREE.LineBasicMaterial({ color: color });
	var line = new THREE.Line(geometry, lineMaterial);
	this.add(line);
	return line;
}


// SpriteMorph
SpriteMorph.prototype.initBeetle = function() {
	var myself = this;

	this.beetle = new THREE.Object3D();
	this.beetle.name = 'beetle';
	this.beetle.color = new THREE.Color();

	// To avoid precision loss, we keep state here and perform transformations on 
	// the beetle's actual properties by using these values
	this.beetle.color.state = {
		h: 30,
		s: 50,
		l: 50,
		set: function(h, s, l) {
			this.h = h;
			this.s = s;
			this.l = l;
		}
	}

	this.beetle.color.reset = function () {
		this.state.set(30, 50, 50);
		this.update();
		myself.beetle.shape.material.opacity = 1;
	}

	this.beetle.color.update = function() {
		hsl = myself.beetle.color.state;
		this.setHSL(hsl.h/360, hsl.s/100, hsl.l/100);
		myself.beetle.shape.material.color = this;
	}

	var material = new THREE.MeshLambertMaterial( { color: this.beetle.color, transparent: true } );
	var geometry = new THREE.CylinderGeometry( 0, 0.25, 0.7, 32);

	this.beetle.shape = new THREE.Mesh(geometry, material);
	this.beetle.shape.rotation.x = radians(90);
	this.beetle.shape.position.z = 0.35;
	this.beetle.shape.name = 'beetleShape';

	this.beetle.posAndRotStack = new Array();

	this.beetle.multiplierScale = 1;

	// extrusion
	this.beetle.extruding = false;
	this.beetle.currentExtrusion = null;
	this.beetle.extrusionDiameter = 1;

	// drawing
	this.beetle.drawing = false;

	// reset
	this.beetle.reset = function() {	
		this.position.set(0, 0, 0);
		this.rotation.set(0, 0, 0);
	}

	// visibility
	this.beetle.toggleVisibility = function() {
		this.shape.visible = this.shape.visible ? 0 : 1;
		myself.parentThatIsA(StageMorph).reRender();
	}

	this.beetle.add(this.beetle.shape);

	this.beetle.reset();
	this.beetle.color.reset();

	this.beetle.axes = [];
	// beetle's local axis lines
	p = new THREE.Vector3(1,0,0);
	this.beetle.axes.push(this.beetle.addLineToPointWithColor(p, 0x00FF00));
	p = new THREE.Vector3(0,1,0);
	this.beetle.axes.push(this.beetle.addLineToPointWithColor(p, 0x0000FF));
	p = new THREE.Vector3(0,0,1);
	this.beetle.axes.push(this.beetle.addLineToPointWithColor(p, 0xFF0000));
}

SpriteMorph.prototype.originalInit = SpriteMorph.prototype.init;
SpriteMorph.prototype.init = function(globals) {
	this.initBeetle();
	this.originalInit(globals);
}

// Definition of new BeetleBlocks categories
SpriteMorph.prototype.categories =
    [
        'motion',
        'control',
        'shapes',
		'colors',
        'sensing',
        'operators',
        'variables',
        'lists',
        'my blocks'
    ];

SpriteMorph.prototype.blockColor = {
    motion : new Color(74, 108, 212),
    shapes : new Color(143, 86, 227),
	colors : new Color(207, 74, 217),
	sound : new Color(207, 74, 217), // we need to keep this color for the zoom blocks dialog
    control : new Color(230, 168, 34),
    sensing : new Color(4, 148, 220),
    operators : new Color(98, 194, 19),
    variables : new Color(243, 118, 29),
    lists : new Color(217, 77, 17),
    other : new Color(150, 150, 150),
    'my blocks': new Color(150, 150, 60),
};

// Block specs

SpriteMorph.prototype.originalInitBlocks = SpriteMorph.prototype.initBlocks;

SpriteMorph.prototype.initBlocks = function() {

	var myself = this;
	this.originalInitBlocks();
	
	// Uncomment this to get backwards compatibility with previously saved projects.
	// After fixing these projects, save them and comment this code again:

	/*

		this.blocks.setExtrusionRadius = this.blocks.setExtrusionDiameter;
		this.blocks.changeExtrusionRadius = this.blocks.changeExtrusionDiameter;

		// Projects using the old HSL blocks will fail to run, you'll need to replace
		// all color related blocks.

		this.blocks.setHSL = this.blocks.setHSLA;
		this.blocks.changeHSL = this.blocks.changeHSLA;
		this.blocks.getHSL = this.blocks.getHSLA;

		// Additionally, you'll need to re-select global coordinates, as they are
		// now uppercase.

	*/

	// motion
	this.blocks.goHome =
	{
			type: 'command',
			spec: 'go home',
			category: 'motion'
	};		
	this.blocks.move =
	{
			type: 'command',
			spec: 'move %n',
			category: 'motion',
			defaults: [1]
	};
	this.blocks.rotate =
	{
			type: 'command',
			spec: 'rotate %axes by %n',
			category: 'motion',
			defaults: ['z', 15]
	};
	this.blocks.setPosition =
	{
			type: 'command',
			spec: 'go to x: %n y: %n z: %n',
			category: 'motion',
			defaults: [0, 0, 0]
	};
	this.blocks.setPositionOnAxis =
	{
			type: 'command',
			spec: 'set %axes to %n',
			category: 'motion',
			defaults: ['x', 0]
	};
	this.blocks.changePositionBy =
	{
			type: 'command', 
			spec: 'change %axes by %n',
			category: 'motion',
			defaults: ['x', 1]
	};
	this.blocks.setRotationOnAxis =
	{
			type: 'command',
			spec: 'set %axes rotation to %n',	
			category: 'motion',
			defaults: ['z', 0]
	};
	this.blocks.pointTowards =
	{
			type: 'command',
			spec: 'point towards x: %n y: %n z: %n',
			category: 'motion',
			defaults: [0, 0, 0]
	};
	this.blocks.getPosition =
	{
			type: 'reporter',
			spec: '%axes position',
			category: 'motion',
			defaults: ['x']
	};
	this.blocks.getRotation =
	{
			type: 'reporter',
			spec: '%axes rotation',
			category: 'motion',
			defaults: ['z']
	};
	this.blocks.pushPosition =
	{
			type: 'command',
			spec: 'push position',
			category: 'motion'
	};
	this.blocks.popPosition =
	{
			type: 'command',
			spec: 'pop position',
			category: 'motion'
	};
	this.blocks.setScale =
	{
			type: 'command',
			spec: 'set scale to %n',
			category: 'motion',
			defaults: [1]
	};
	this.blocks.changeScale =
	{
			type: 'command',
			spec: 'change scale by %n',
			category: 'motion',
			defaults: [0.5]
	};
	this.blocks.reportScale = 
	{
			type: 'reporter',
			spec: 'scale',
			category: 'motion'
	}

	// shapes
	this.blocks.clear =
	{
			type: 'command',
			spec: 'clear',
			category: 'shapes'
	};
	this.blocks.cube =
	{
			type: 'command',
			spec: 'cube size %n',
			category: 'shapes',
			defaults: [0.5]
	};
	this.blocks.cuboid =
	{
			type: 'command',
			spec: 'cuboid l: %n w: %n h: %n',
			category: 'shapes',
			defaults: [1, 0.5, 0.3]
	};
	this.blocks.sphere =
	{
			type: 'command',
			spec: 'sphere diameter %n',
			category: 'shapes',
			defaults: [0.5]		
	};
	this.blocks.tube =
	{
			type: 'command',
			spec: 'tube l: %n outer: %n inner: %n',
			category: 'shapes',
			defaults: [2, 1, 0.5]
	};
	this.blocks.text =
	{
			type: 'command', 
			spec: 'text %s height %n depth %n',
			category: 'shapes',
			defaults: ['hello', 1, 0.5]
	};
	this.blocks.startDrawing =
	{
			type: 'command',
			spec: 'start drawing',
			category: 'shapes'
	};		 
	this.blocks.stopDrawing =
	{
			type: 'command',
			spec: 'stop drawing',
			category: 'shapes'
	};

	this.blocks.startExtrusion =
	{
			type: 'command',
			spec: 'start extruding',
			category: 'shapes'
	};
	this.blocks.stopExtrusion =
	{
			type: 'command',
			spec: 'stop extruding',
			category: 'shapes'
	};
	this.blocks.setExtrusionDiameter =
	{
			type: 'command',
			spec: 'set extrusion diameter to %n',
			category: 'shapes',
			defaults: [1]
	};
	this.blocks.changeExtrusionDiameter =
	{
			type: 'command',
			spec: 'change extrusion diameter by %n',
			category: 'shapes',
			defaults: [1]
	};

	// color
	this.blocks.setHSLA =
	{
			type: 'command', 
			spec: 'set %hsla to %n',	
			category: 'colors',
			defaults: ['hue', 50]
	};
	this.blocks.changeHSLA =
	{
			type: 'command', 
			spec: 'change %hsla by %n',
			category: 'colors',
			defaults: ['hue', 10]
	};
	this.blocks.getHSLA =
	{
			type: 'reporter',
			spec: 'color %hsla',
			category: 'colors'
	};

	// sensing
	this.blocks.doAsk = 
	{
            type: 'command',
            category: 'sensing',
            spec: 'request user input',
			category: 'sensing'
    };

}

SpriteMorph.prototype.initBlocks();

// We do not proxy blockTemplates anymore, as we've changed practically everything

SpriteMorph.prototype.blockTemplates = function(category) {
	var blocks = [], myself = this, varNames, button,
        cat = category || 'motion', txt;

    function block(selector) {
        if (StageMorph.prototype.hiddenPrimitives[selector]) {
            return null;
        }
        var newBlock = SpriteMorph.prototype.blockForSelector(selector, true);
        newBlock.isTemplate = true;
        return newBlock;
    }

    function variableBlock(varName) {
        var newBlock = SpriteMorph.prototype.variableBlock(varName);
        newBlock.isDraggable = false;
        newBlock.isTemplate = true;
        return newBlock;
    }

    function watcherToggle(selector) {
        if (StageMorph.prototype.hiddenPrimitives[selector]) {
            return null;
        }
        var info = SpriteMorph.prototype.blocks[selector];
        return new ToggleMorph(
            'checkbox',
            this,
            function () {
                myself.toggleWatcher(
                    selector,
                    localize(info.spec),
                    myself.blockColor[info.category]
                );
            },
            null,
            function () {
                return myself.showingWatcher(selector);
            },
            null
        );
    }

    function variableWatcherToggle(varName) {
        return new ToggleMorph(
            'checkbox',
            this,
            function () {
                myself.toggleVariableWatcher(varName);
            },
            null,
            function () {
                return myself.showingVariableWatcher(varName);
            },
            null
        );
    }

    function helpMenu() {
        var menu = new MenuMorph(this);
        menu.addItem('help...', 'showHelp');
        return menu;
    }

    function addVar(pair) {
        if (pair) {
            if (myself.variables.silentFind(pair[0])) {
                myself.inform('that name is already in use');
            } else {
                myself.addVariable(pair[0], pair[1]);
                myself.toggleVariableWatcher(pair[0], pair[1]);
                myself.blocksCache[cat] = null;
                myself.paletteCache[cat] = null;
                myself.parentThatIsA(IDE_Morph).refreshPalette();
            }
        }
    }

	if (cat === 'motion') {
		blocks.push(block('goHome'));
		blocks.push('-');
		blocks.push(block('move'));
		blocks.push(block('rotate'));
		blocks.push('-');
		blocks.push(block('setPosition'));
		blocks.push(block('setPositionOnAxis'));
		blocks.push(block('changePositionBy'));
		blocks.push(block('setRotationOnAxis'));
		blocks.push(block('pointTowards'));
		blocks.push(block('getPosition'));
		blocks.push(block('getRotation'));
		blocks.push(block('pushPosition'));
		blocks.push(block('popPosition'));
		blocks.push('-');
		blocks.push(block('setScale'));
		blocks.push(block('changeScale'));
		blocks.push(block('reportScale'));

	} else if (cat === 'shapes') {
		blocks.push(block('clear'));
		blocks.push('-');
		blocks.push(block('cube'));
		blocks.push(block('cuboid'));
		blocks.push(block('sphere'));
		blocks.push(block('tube'));
		blocks.push(block('text'));
		blocks.push(block('startDrawing'));
		blocks.push(block('stopDrawing'));
		blocks.push(block('startExtrusion'));
		blocks.push(block('stopExtrusion'));
		blocks.push(block('setExtrusionDiameter'));
		blocks.push(block('changeExtrusionDiameter'));

	} else if (cat === 'colors') {
		blocks.push(block('setHSLA'));
		blocks.push(block('changeHSLA'));
		blocks.push(block('getHSLA'));

	} else if (cat === 'control') {

        blocks.push(block('receiveGo'));
        blocks.push(block('receiveKey'));
        blocks.push(block('receiveClick'));
        blocks.push(block('receiveMessage'));
        blocks.push('-');
        blocks.push(block('doBroadcast'));
        blocks.push(block('doBroadcastAndWait'));
        blocks.push(watcherToggle('getLastMessage'));
        blocks.push(block('getLastMessage'));
        blocks.push('-');
        blocks.push(block('doWarp'));
        blocks.push('-');
        blocks.push(block('doWait'));
        blocks.push(block('doWaitUntil'));
        blocks.push('-');
        blocks.push(block('doForever'));
        blocks.push(block('doRepeat'));
        blocks.push(block('doUntil'));
        blocks.push('-');
        blocks.push(block('doIf'));
        blocks.push(block('doIfElse'));
        blocks.push('-');
        blocks.push(block('doReport'));
        blocks.push('-');
        blocks.push(block('doStopThis'));
        blocks.push(block('doStopOthers'));
        blocks.push('-');
        blocks.push(block('doRun'));
        blocks.push(block('fork'));
        blocks.push(block('evaluate'));
        blocks.push('-');
        blocks.push(block('doCallCC'));
        blocks.push(block('reportCallCC'));
        /*blocks.push('-');
        blocks.push(block('receiveOnClone'));
        blocks.push(block('createClone'));
        blocks.push(block('removeClone'));*/
        blocks.push('-');
        blocks.push(block('doPauseAll'));

	} else if (cat === 'sensing') {
        blocks.push(block('doAsk'));
        blocks.push(watcherToggle('getLastAnswer'));
        blocks.push(block('getLastAnswer'));
        blocks.push('-');
        blocks.push(watcherToggle('reportMouseX'));
        blocks.push(block('reportMouseX'));
        blocks.push(watcherToggle('reportMouseY'));
        blocks.push(block('reportMouseY'));
        blocks.push(block('reportMouseDown'));
        blocks.push('-');
        blocks.push(block('reportKeyPressed'));
        blocks.push('-');
		blocks.push(block('doResetTimer'));
        blocks.push(watcherToggle('getTimer'));
        blocks.push(block('getTimer'));
        blocks.push('-');
        blocks.push(block('reportURL'));
        blocks.push('-');
        blocks.push(block('reportIsFastTracking'));
        blocks.push(block('doSetFastTracking'));
        blocks.push('-');
        blocks.push(block('reportDate'));

    // for debugging: ///////////////

        if (this.world().isDevMode) {

            blocks.push('-');
            txt = new TextMorph(localize(
                'development mode \ndebugging primitives:'
            ));
            txt.fontSize = 9;
            txt.setColor(this.paletteTextColor);
            blocks.push(txt);
            blocks.push('-');
            blocks.push(block('reportStackSize'));
            blocks.push(block('reportFrameCount'));
        }

    } else if (cat === 'operators') {

        blocks.push(block('reifyScript'));
        blocks.push(block('reifyReporter'));
        blocks.push(block('reifyPredicate'));
        blocks.push('#');
        blocks.push('-');
        blocks.push(block('reportSum'));
        blocks.push(block('reportDifference'));
        blocks.push(block('reportProduct'));
        blocks.push(block('reportQuotient'));
        blocks.push('-');
        blocks.push(block('reportModulus'));
        blocks.push(block('reportRound'));
        blocks.push(block('reportMonadic'));
        blocks.push(block('reportRandom'));
        blocks.push('-');
        blocks.push(block('reportLessThan'));
        blocks.push(block('reportEquals'));
        blocks.push(block('reportGreaterThan'));
        blocks.push('-');
        blocks.push(block('reportAnd'));
        blocks.push(block('reportOr'));
        blocks.push(block('reportNot'));
        blocks.push('-');
        blocks.push(block('reportTrue'));
        blocks.push(block('reportFalse'));
        blocks.push('-');
        blocks.push(block('reportJoinWords'));
        blocks.push(block('reportTextSplit'));
        blocks.push(block('reportLetter'));
        blocks.push(block('reportStringSize'));
        blocks.push('-');
        blocks.push(block('reportUnicode'));
        blocks.push(block('reportUnicodeAsLetter'));
        blocks.push('-');
        blocks.push(block('reportIsA'));
        blocks.push(block('reportIsIdentical'));
        blocks.push('-');
        blocks.push(block('reportJSFunction'));

    // for debugging: ///////////////

        if (this.world().isDevMode) {
            blocks.push('-');
            txt = new TextMorph(
                'development mode \ndebugging primitives:'
            );
            txt.fontSize = 9;
            txt.setColor(this.paletteTextColor);
            blocks.push(txt);
            blocks.push('-');
            blocks.push(block('reportTypeOf'));
            blocks.push(block('reportTextFunction'));
        }

    /////////////////////////////////

    } else if (cat === 'variables') {

        button = new PushButtonMorph(
            null,
            function () {
                new VariableDialogMorph(
                    null,
                    addVar,
                    myself
                ).prompt(
                    'Variable name',
                    null,
                    myself.world()
                );
            },
            'Make a variable'
        );
        button.userMenu = helpMenu;
        button.selector = 'addVariable';
        button.showHelp = BlockMorph.prototype.showHelp;
        blocks.push(button);

        if (this.variables.allNames().length > 0) {
            button = new PushButtonMorph(
                null,
                function () {
                    var menu = new MenuMorph(
                        myself.deleteVariable,
                        null,
                        myself
                    );
                    myself.variables.allNames().forEach(function (name) {
                        menu.addItem(name, name);
                    });
                    menu.popUpAtHand(myself.world());
                },
                'Delete a variable'
            );
            button.userMenu = helpMenu;
            button.selector = 'deleteVariable';
            button.showHelp = BlockMorph.prototype.showHelp;
            blocks.push(button);
        }

        blocks.push('-');

        varNames = this.variables.allNames();
        if (varNames.length > 0) {
            varNames.forEach(function (name) {
                blocks.push(variableWatcherToggle(name));
                blocks.push(variableBlock(name));
            });
            blocks.push('-');
        }

        blocks.push(block('doSetVar'));
        blocks.push(block('doChangeVar'));
        blocks.push(block('doShowVar'));
        blocks.push(block('doHideVar'));
        blocks.push(block('doDeclareVariables'));

        blocks.push('=');

        blocks.push(block('reportNewList'));
        blocks.push('-');
        blocks.push(block('reportCONS'));
        blocks.push(block('reportListItem'));
        blocks.push(block('reportCDR'));
        blocks.push('-');
        blocks.push(block('reportListLength'));
        blocks.push(block('reportListContainsItem'));
        blocks.push('-');
        blocks.push(block('doAddToList'));
        blocks.push(block('doDeleteFromList'));
        blocks.push(block('doInsertInList'));
        blocks.push(block('doReplaceInList'));

    // for debugging: ///////////////

        if (this.world().isDevMode) {
            blocks.push('-');
            txt = new TextMorph(localize(
                'development mode \ndebugging primitives:'
            ));
            txt.fontSize = 9;
            txt.setColor(this.paletteTextColor);
            blocks.push(txt);
            blocks.push('-');
            blocks.push(block('reportMap'));
            blocks.push('-');
            blocks.push(block('doForEach'));
        }

    /////////////////////////////////

        blocks.push('=');

        if (StageMorph.prototype.enableCodeMapping) {
            blocks.push(block('doMapCodeOrHeader'));
            blocks.push(block('doMapStringCode'));
            blocks.push(block('doMapListCode'));
            blocks.push('-');
            blocks.push(block('reportMappedCode'));
            blocks.push('=');
        }

	} else if (cat === 'my blocks') {
		button = new PushButtonMorph(
            null,
            function () {
                var ide = myself.parentThatIsA(IDE_Morph),
                    stage = myself.parentThatIsA(StageMorph);
                new BlockDialogMorph(
                    null,
                    function (definition) {
                        if (definition.spec !== '') {
                            if (definition.isGlobal) {
                                stage.globalBlocks.push(definition);
                            } else {
                                myself.customBlocks.push(definition);
                            }
                            ide.flushPaletteCache();
                            ide.refreshPalette();
                            new BlockEditorMorph(definition, myself).popUp();
                        }
                    },
                    myself
                ).prompt(
                    'Make a block',
                    null,
                    myself.world()
                );
            },
            'Make a block'
        );
        button.userMenu = helpMenu;
        button.selector = 'addCustomBlock';
        button.showHelp = BlockMorph.prototype.showHelp;
        blocks.push(button);
	}

	return blocks;
}

// Single Sprite mode

SpriteMorph.prototype.drawNew = function () { this.hide() }

// StageMorph

StageMorph.prototype.originalDestroy = StageMorph.prototype.destroy;
StageMorph.prototype.destroy = function() {
	var myself = this;
	this.scene.remove(this.myObjects);
	this.children.forEach(function(eachSprite) {
		myself.parentThatIsA(IDE_Morph).removeSprite(eachSprite);
	});
	this.originalDestroy();
}

StageMorph.prototype.originalInit = StageMorph.prototype.init;
StageMorph.prototype.init = function(globals) {
    this.originalInit(globals);
	this.initScene();
	this.initRenderer();
	this.initCamera();
	this.initLights();

	this.scene.grid.draw();
	
	this.myObjects = new THREE.Object3D();
	this.scene.add(this.myObjects);

    this.trailsCanvas = this.renderer.domElement;
};

StageMorph.prototype.initScene = function() {
	var myself = this;
	this.scene = new THREE.Scene();
	this.scene.axes = [];
	this.scene.grid = {};
	this.scene.grid.defaultColor = 0xAAAAAA;
	this.scene.grid.visible = false;
	this.scene.grid.interval = new Point(1, 1);

	// Grid
	this.scene.grid.draw = function() {

		var color = this.lines ? this.lines[0].material.color : this.defaultColor;

		if (this.lines) {
			this.lines.forEach(function(eachLine){
				myself.scene.remove(eachLine)
			});
		}

		this.lines = [];

		for (x = -10 / this.interval.x; x <= 10 / this.interval.x; x++) {
			p1 = new THREE.Vector3(x * this.interval.x, 0, -10);
			p2 = new THREE.Vector3(x * this.interval.x, 0, 10);
			l = myself.scene.addLineFromPointToPointWithColor(p1, p2, color);
			l.visible = this.visible;
			this.lines.push(l);
		}

		for (y = -10 / this.interval.y; y <= 10 / this.interval.y; y++) {
			p1 = new THREE.Vector3(-10, 0, y * this.interval.y);
			p2 = new THREE.Vector3(10, 0, y * this.interval.y);
			l = myself.scene.addLineFromPointToPointWithColor(p1, p2, color);
			l.visible = this.visible;
			this.lines.push(l);
		}

		myself.reRender();
	}

	this.scene.grid.setInterval = function(aPoint) {
		this.interval = aPoint;
		this.draw();
	}

	this.scene.grid.setColor = function(color) {
		this.lines.forEach(function(eachLine) {
			eachLine.material.color.setHex(color);
		})
	};

	this.scene.grid.toggle = function() {
		var myInnerSelf = this;
		this.visible = !this.visible;
		this.lines.forEach(function(line){ line.visible = myInnerSelf.visible });
		myself.reRender();
	}

	// Axes
	p = new THREE.Vector3(5,0,0);
	this.scene.axes.push(this.scene.addLineToPointWithColor(p, 0x00FF00));
	p = new THREE.Vector3(0,5,0);
	this.scene.axes.push(this.scene.addLineToPointWithColor(p, 0x0000FF));
	p = new THREE.Vector3(0,0,5);
	this.scene.axes.push(this.scene.addLineToPointWithColor(p, 0xFF0000));
}

StageMorph.prototype.initRenderer = function() {
	var myself = this,
      dpr = window.devicePixelRatio;
	
	this.renderer = new THREE.WebGLRenderer({ antialias: true });
	this.renderer.setSize(480 / dpr, 360 / dpr); // ugly! this.width(), this.height() is not set yet!
	this.renderer.setClearColor(0xCCCCCC, 1);
	this.renderer.changed = false;
	this.renderer.isWireframeMode = false;
	this.renderer.showingAxes = true;
	this.renderer.isParallelProjection = false;

	this.renderer.toggleWireframe = function() {
		var myInnerSelf = this;
		this.isWireframeMode = !this.isWireframeMode;
		myself.myObjects.children.forEach(function(eachObject) {
			eachObject.material.wireframe = myInnerSelf.isWireframeMode;
		});
		myself.reRender();
	}

	this.renderer.toggleAxes = function() {
		var myInnerSelf = this;
		this.showingAxes = !this.showingAxes;

		myself.scene.axes.forEach(function(line){ line.visible = myInnerSelf.showingAxes });
		myself.children.forEach(function(morph) {
			if (morph instanceof SpriteMorph) {
				morph.beetle.axes.forEach(function(line){ line.visible = myInnerSelf.showingAxes });
			}
		})
		myself.reRender();
	}

	this.renderer.toggleParallelProjection = function() {
		this.isParallelProjection = !this.isParallelProjection;
		myself.initCamera();
	}
}


StageMorph.prototype.render = function() {
	this.pointLight.position = this.camera.position; // lights move with the camera
	this.directionalLight.position = this.camera.position;
	this.renderer.render(this.scene, this.camera);
};

StageMorph.prototype.renderCycle = function() {
   	if (this.renderer.changed) {
		this.render();
		this.changed();
		this.parentThatIsA(IDE_Morph).statusDisplay.refresh();
		this.renderer.changed = false;
	}
}

StageMorph.prototype.reRender = function() {
    this.renderer.changed = true;
}

StageMorph.prototype.initCamera = function() {
	var myself = this,
		threeLayer;

	if (this.scene.camera) { this.scene.remove(this.camera) };

	var createCamera = function() {
			threeLayer = document.createElement('div');

			if (myself.renderer.isParallelProjection) { 
					var zoom = myself.camera ? myself.camera.zoomFactor : 82,
						width = Math.max(myself.width(), 480),
						height = Math.max(myself.height(), 360);
					myself.camera = new THREE.OrthographicCamera(
									width / - zoom,
									width / zoom,
									height / zoom,
									height / - zoom,
									0.1, 
									1000);
			} else {
					myself.camera = new THREE.PerspectiveCamera(60, 480/360, 1, 1000);
			}

			// We need to implement zooming ourselves for parallel projection

			myself.camera.zoomIn = function() {
					this.zoomFactor /= 1.1;
					this.applyZoom();
			}
			myself.camera.zoomOut = function() {
					this.zoomFactor *= 1.1;
					this.applyZoom();
			}

			myself.camera.applyZoom = function() {
					var zoom = myself.camera ? myself.camera.zoomFactor : 82,
						width = Math.max(myself.width(), 480),
						height = Math.max(myself.height(), 360);
					this.left = width / - zoom;
					this.right = width / zoom;
					this.top = height / zoom;
					this.bottom = height / - zoom;
					this.updateProjectionMatrix();	
			}

			myself.camera.reset = function() {

					myself.controls = new THREE.OrbitControls(this, threeLayer);
					myself.controls.addEventListener('change', function(event) { myself.render });

					if (myself.renderer.isParallelProjection) {
						this.zoomFactor = 82;
						this.applyZoom();
						this.position.set(0,10,0);
						myself.controls.rotateLeft(radians(90));
					} else {
						this.position.set (-5, 7, 5);
						this.lookAt(new THREE.Vector3());
					}

					myself.controls.update();
					myself.reRender();
			}
	}
	
	createCamera();
	this.scene.add(this.camera);
	this.camera.reset();
}

StageMorph.prototype.initLights = function() {
	this.directionalLight = new THREE.DirectionalLight(0x4c4c4c, 1);
	this.directionalLight.position.set(this.camera.position);
	this.scene.add(this.directionalLight);

	this.pointLight = new THREE.PointLight(0xffffff, 1, 200);
	this.pointLight.position.set(this.camera.position);
	this.scene.add(this.pointLight);
}

StageMorph.prototype.originalStep = StageMorph.prototype.step;
StageMorph.prototype.step = function() {
    this.originalStep();

    // update Beetleblocks, if needed
    this.renderCycle();
};

StageMorph.prototype.referencePos = null;

StageMorph.prototype.mouseScroll = function(y, x) {
	if (this.renderer.isParallelProjection) {
	    if (y > 0) {
			this.camera.zoomOut();
    	} else if (y < 0) {
			this.camera.zoomIn();
	    }
	} else {
	    if (y > 0) {
	        this.controls.dollyOut();
    	} else if (y < 0) {
        	this.controls.dollyIn();
	    }
	    this.controls.update();
	}
    this.reRender();
};

StageMorph.prototype.mouseDownLeft = function(pos) {
    this.referencePos = pos;
};

StageMorph.prototype.mouseDownRight = function(pos) {
    this.referencePos = pos;
};

StageMorph.prototype.mouseMove = function(pos, button) {
    deltaX = pos.x - this.referencePos.x;
    deltaY = pos.y - this.referencePos.y;
    this.referencePos = pos
    if (button === 'right' || this.world().currentKey === 16) { // shiftClicked
        this.controls.panLeft(deltaX / this.dimensions.x / this.scale * 15);
        this.controls.panUp(deltaY / this.dimensions.y / this.scale * 10);
    } else {
        horzAngle = deltaX / (this.dimensions.x * this.scale) * 360;
        vertAngle = deltaY / (this.dimensions.y * this.scale) * 360;
        this.controls.rotateLeft(radians(horzAngle));
        this.controls.rotateUp(radians(vertAngle));
    }
    this.controls.update();
    this.reRender();
};

StageMorph.prototype.originalAdd = StageMorph.prototype.add;
StageMorph.prototype.add = function(morph) {
	this.originalAdd(morph);
	if (morph instanceof SpriteMorph) {
		this.scene.add(morph.beetle);
		this.reRender();
	}
}

StageMorph.prototype.clearPenTrails = function() {
    // We'll never need to clear the pen trails in BeetleBlocks, it only causes the renderer to disappear
	nop(); 
};

// StageMorph drawing
StageMorph.prototype.originalDrawOn = StageMorph.prototype.drawOn;
StageMorph.prototype.drawOn = function (aCanvas, aRect) {
	// If the scale is lower than 1, we reuse the original method, 
	// otherwise we need to modify the renderer dimensions
	// we do not need to render the original canvas anymore because 
	// we have removed sprites and backgrounds

    var rectangle, area, delta, src, context, w, h, sl, st;
    if (!this.isVisible) {
        return null;
    }
	if (this.scale < 1) {
		return this.originalDrawOn(aCanvas, aRect);
	}

    rectangle = aRect || this.bounds;
    area = rectangle.intersect(this.bounds).round();
    if (area.extent().gt(new Point(0, 0))) {
        delta = this.position().neg();
        src = area.copy().translateBy(delta).round();
        context = aCanvas.getContext('2d');
        context.globalAlpha = this.alpha;

        sl = src.left();
        st = src.top();
        w = Math.min(src.width(), this.image.width - sl);
        h = Math.min(src.height(), this.image.height - st);

        if (w < 1 || h < 1) {
            return null;
        }

		context.save();
		if (this.scaleChanged) {
			w = this.width();
			h = this.height();
			var dpr = window.devicePixelRatio;
			this.scaleChanged = false;
			this.renderer.setSize(w / dpr, h / dpr);
			this.reRender();
		}

		context.drawImage(
			this.penTrails(),
			src.left() / this.scale,
			src.top() / this.scale,
			w,
			h,
			area.left() / this.scale,
			area.top() / this.scale,
			w,
			h
		);
        context.restore();
    }
};

StageMorph.prototype.originalSetScale = StageMorph.prototype.setScale;
StageMorph.prototype.setScale = function (number) {
	this.scaleChanged = true;
	this.originalSetScale(number);
}

// Contextual menu
StageMorph.prototype.userMenu = function () {
	StageMorph.prototype.userMenu = function () {
    var ide = this.parentThatIsA(IDE_Morph),
        menu = new MenuMorph(this),
        shiftClicked = this.world().currentKey === 16,
        myself = this;

    if (ide && ide.isAppMode) {
        return menu;
    }
    menu.addItem(
        'pic...',
        function () {
            window.open(myself.fullImageClassic().toDataURL());
        },
        'open a new window\nwith a picture of the scene'
    );
	menu.addLine();
	menu.addItem(
		'export as STL',
		function () {
			ide.downloadSTL()
		},
		'export scene as an STL\nfile ready to be printed'
	);
	return menu;
};

}

