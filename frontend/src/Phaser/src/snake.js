/**
 * Phaser snake
 * @param  {Phaser.Game} game      game object
 * @param  {String} spriteKey Phaser sprite key
 * @param  {Number} x         coordinate
 * @param  {Number} y         coordinate
 */
Snake = function(game, spriteKey, x, y) {
    this.game = game;
    //create an array of snakes in the game object and add this snake
    if (!this.game.snakes) {
        this.game.snakes = [];
    }
    this.game.snakes.push(this);
    this.debug = false;
    // debug로 원형 물리 형태로 볼수있음 
    this.snakeLength = 0;
    this.spriteKey = spriteKey;

    //various quantities that can be changed
    this.scale = 0.6;
    this.fastSpeed = 900;
    this.slowSpeed = 300;
    this.speed = this.slowSpeed;
    this.rotationSpeed = 80;

    //initialize groups and arrays
    this.collisionGroup = this.game.physics.p2.createCollisionGroup();
    this.sections = [];
    //the head path is an array of points that the head of the snake has
    //traveled through
    this.headPath = [];
    this.food = [];
    // food.js의 food를 불러오기위한
    // 위 배열은 뱀이 현재 소비하고 있는 모든 음식 포함
    // 뱀과 충돌했지만 아직 파괴되지않은 음식을 의미
    // 위가 필요한 이유는 뱀이 파괴되었을때 뱀을 파괴하고 음식으로 대체하기 위한것

    this.preferredDistance = 17 * this.scale;
    this.queuedSections = 0;

    //initialize the shadow
    this.shadow = new Shadow(this.game, this.sections, this.scale);
    this.sectionGroup = this.game.add.group();
    //add the head of the snake
    this.head = this.addSectionAtPosition(x,y);
    this.head.name = "head";
    this.head.snake = this;

    this.lastHeadPosition = new Phaser.Point(this.head.body.x, this.head.body.y);
    //add 4 sections behind the head
    this.initSections(30);

    //initialize the eyes
    this.eyes = new EyePair(this.game, this.head, this.scale);

    //the edge is the front body that can collide with other snakes
    //it is locked to the head of this snake
    this.edgeOffset = 4;
    this.edge = this.game.add.sprite(x, y - this.edgeOffset, this.spriteKey);
    this.edge.name = "edge";
    this.edge.alpha = 0;
    this.game.physics.p2.enable(this.edge, true);
    this.edge.body.setCircle(this.edgeOffset);

    //constrain edge to the front of the head
    this.edgeLock = this.game.physics.p2.createLockConstraint(
        this.edge.body, this.head.body, [0, -this.head.width*0.5-this.edgeOffset]
    );

    this.edge.body.onBeginContact.add(this.edgeContact, this);
    
    // launching_pad 만든거
    this.launching_pad = this.game.add.sprite(x, y- this.edgeOffset*2, 'bullet');
    this.launching_pad.name = "launching_pad";
    this.launching_pad.tint = 0x00BFFF;
    this.game.physics.p2.enable(this.launching_pad, this.debug);
    this.launching_pad.body.setCircle(this.edgeOffset);
    this.launching_pad.alpha = 1;

    this.launching_padLock = this.game.physics.p2.createLockConstraint(
        this.launching_pad.body, this.head.body, [0, -this.head.width*0.5-this.edgeOffset*8]
    );
    // </launching_pad 끝>


    this.onDestroyedCallbacks = [];
    this.onDestroyedContexts = [];
}

Snake.prototype = {
    /**
     * Give the snake starting segments
     * @param  {Number} num number of snake sections to create
     */
    initSections: function(num) {
        //create a certain number of sections behind the head
        //only use this once
        for (var i = 1 ; i <= num ; i++) {
            var x = this.head.body.x;
            var y = this.head.body.y + i * this.preferredDistance;
            this.addSectionAtPosition(x, y);
            //add a point to the head path so that the section stays there (this.headPath가 뱀 머리가 통과한 점들의 배열)
            this.headPath.push(new Phaser.Point(x,y));
            // this.headPath는 뱀 머리가 통과 한 점들의 배열
            // 처음에는 아무 지점도 통과하지 못했기 때문에 초기 섹션을 추가한 지점을 추가.
            // 매번 initSection을 부름으로서 뱀의 형태를 보존가능
        }

    },
    /**
     * Add a section to the snake at a given position
     * @param  {Number} x coordinate
     * @param  {Number} y coordinate
     * @return {Phaser.Sprite}   new section
     */
    addSectionAtPosition: function(x, y) {
        //initialize a new section
        var sec = this.game.add.sprite(x, y, this.spriteKey);
        this.game.physics.p2.enable(sec, this.debug);
        sec.body.setCollisionGroup(this.collisionGroup);
        sec.body.collides([]);
        sec.body.kinematic = true;

        this.snakeLength++;
        this.sectionGroup.add(sec);
        sec.sendToBack();
        sec.scale.setTo(this.scale);

        this.sections.push(sec);

        this.shadow.add(x,y);
        //add a circle body to this section
        sec.body.clearShapes();
        sec.body.addCircle(sec.width*0.5);

        return sec;
    },
    /**
     * Add to the queue of new sections
     * @param  {Integer} amount Number of sections to add to queue
     */
    addSectionsAfterLast: function(amount) {
        this.queuedSections += amount;
    },

    subSectionsAfterLast: function(amount){
        this.queuedSections -= amount;
    },
    /**
     * Call from the main update loop
     */
    update: function() {
        var speed = this.speed;
        this.head.body.moveForward(speed);
        // 먼저 head를 이동하고 headPath의 마지막 점을 제거한 다음 새 머리 위치를 배열의 앞쪽에 배치

        //remove the last element of an array that contains points which
        //the head traveled through
        //then move this point to the front of the array and change its value
        //to be where the head is located
        var point = this.headPath.pop();
        point.setTo(this.head.body.x, this.head.body.y);
        this.headPath.unshift(point);

        //place each section of the snake on the path of the snake head,
        //a certain distance from the section before it
        var index = 0;
        var lastIndex = null;
        for (var i = 0 ; i < this.snakeLength ; i++) {

            this.sections[i].body.x = this.headPath[index].x;
            this.sections[i].body.y = this.headPath[index].y;

            //hide sections if they are at the same position
            if (lastIndex && index == lastIndex) {
                this.sections[i].alpha = 0;
            }
            else {
                this.sections[i].alpha = 1;
            }

            lastIndex = index;
            //this finds the index in the head path array that the next point
            //should be at
            index = this.findNextPointIndex(index);
        }

        //continuously adjust the size of the head path array so that we
        //keep only an array of points that we need
        if (index >= this.headPath.length - 1) {
            var lastPos = this.headPath[this.headPath.length - 1];
            this.headPath.push(new Phaser.Point(lastPos.x, lastPos.y));
        }
        else {
            this.headPath.pop();
        }

        //this calls onCycleComplete every time a cycle is completed
        //a cycle is the time it takes the second section of a snake to reach
        //where the head of the snake was at the end of the last cycle
        var i = 0;
        var found = false;
        while (this.headPath[i].x != this.sections[1].body.x &&
        this.headPath[i].y != this.sections[1].body.y) {
            if (this.headPath[i].x == this.lastHeadPosition.x &&
            this.headPath[i].y == this.lastHeadPosition.y) {
                found = true;
                break;
            }
            i++;
        }
        if (!found) {
            this.lastHeadPosition = new Phaser.Point(this.head.body.x, this.head.body.y);
            this.onCycleComplete();
        }

        //update the eyes and the shadow below the snake
        this.eyes.update();
        this.shadow.update();
    },
    /**
     * Find in the headPath array which point the next section of the snake
     * should be placed at, based on the distance between points
     * @param  {Integer} currentIndex Index of the previous snake section
     * @return {Integer}              new index
     */
    findNextPointIndex: function(currentIndex) {
        var pt = this.headPath[currentIndex];
        //we are trying to find a point at approximately this distance away
        //from the point before it, where the distance is the total length of
        //all the lines connecting the two points
        var prefDist = this.preferredDistance;
        var len = 0;
        var dif = len - prefDist;
        var i = currentIndex;
        var prevDif = null;
        //this loop sums the distances between points on the path of the head
        //starting from the given index of the function and continues until
        //this sum nears the preferred distance between two snake sections
        while (i+1 < this.headPath.length && (dif === null || dif < 0)) {
            //get distance between next two points
            var dist = Util.distanceFormula(
                this.headPath[i].x, this.headPath[i].y,
                this.headPath[i+1].x, this.headPath[i+1].y
            );
            len += dist;
            prevDif = dif;
            //we are trying to get the difference between the current sum and
            //the preferred distance close to zero
            dif = len - prefDist;
            i++;
        }

        //choose the index that makes the difference closer to zero
        //once the loop is complete
        if (prevDif === null || Math.abs(prevDif) > Math.abs(dif)) {
            return i;
        }
        else {
            return i-1;
        }
    },
    /**
     * Called each time the snake's second section reaches where the
     * first section was at the last call (completed a single cycle)
     */
    onCycleComplete: function() {
        if (this.queuedSections > 0) {
            var lastSec = this.sections[this.sections.length - 1];
            this.addSectionAtPosition(lastSec.body.x, lastSec.body.y);
            this.queuedSections--;
        }
    },
    /**
     * Set snake scale
     * @param  {Number} scale Scale
     */

     // 아래 메소드에 뱀 머리가 커질때 생기는 엣지의 역할을 키우는 것
    setScale: function(scale) {
        this.scale = scale;
        this.preferredDistance = 17 * this.scale;

        //update edge lock location with p2 physics
        // 엣지lock 조건을 업데이트하고 새로운 헤드 스케일을 기반으로 헤드에서 추가 오프셋에 엣지를 배치
        this.edgeLock.localOffsetB = [
            0, this.game.physics.p2.pxmi(this.head.width*0.5+this.edgeOffset)
        ];

        //scale sections and their bodies
        for (var i = 0 ; i < this.sections.length ; i++) {
            var sec = this.sections[i];
            sec.scale.setTo(this.scale);
            sec.body.data.shapes[0].radius = this.game.physics.p2.pxm(sec.width*0.5);
        }

        //scale eyes and shadows
        this.eyes.setScale(scale);
        this.shadow.setScale(scale);
    },
    /**
     * Increment length and scale
     */
    incrementSize: function() {
        this.addSectionsAfterLast(1);
        this.setScale(this.scale * 1.01);
    },

    decreaseSize: function(){
        this.subSectionsAfterLast(1);
        this.setScale(this.scale*1.005);
    },
    /**
     * Destroy the snake
     */
    destroy: function() {
        console.log("Destroy is start");
        this.game.snakes.splice(this.game.snakes.indexOf(this), 1);
        //remove constraints
        // 스프라이트 바디와 함께 contraints를 죽임
        this.game.physics.p2.removeConstraint(this.edgeLock);
        this.edge.destroy();
        //destroy food that is constrained to the snake head
        // 아래는 아직 뱀이 가지고있는 파괴되지않은 모든 음식을 전부 죽이는것
        for (var i = this.food.length - 1 ; i >= 0 ; i--) {
            this.food[i].destroy();
        }
        //destroy everything else
        this.sections.forEach(function(sec, index) {
            sec.destroy();
        });

        this.game.physics.p2.removeConstraint(this.launching_padLock);
        this.launching_pad.destroy();
        this.eyes.destroy();
        this.shadow.destroy();

        //call this snake's destruction callbacks
        for (var i = 0 ; i < this.onDestroyedCallbacks.length ; i++) {
            if (typeof this.onDestroyedCallbacks[i] == "function") {
                this.onDestroyedCallbacks[i].apply(
                    this.onDestroyedContexts[i], [this]);
            }
        }
    },
    /**
     * Called when the front of the snake (the edge) hits something
     * @param  {Phaser.Physics.P2.Body} phaserBody body it hit
     */
    edgeContact: function(phaserBody) {
        //if the edge hits another snake's section, destroy this snake
        if (phaserBody && this.sections.indexOf(phaserBody.sprite) == -1) {
            console.log("Edge is contacted to a sprite");
            this.destroy();
        }
        // 위에서 엣지 그니까 뱀머리가 다른 뱀의 단면에 치이면 파괴되는것으 구현한것
        //if the edge hits this snake's own section, a simple solution to avoid
        //glitches is to move the edge to the center of the head, where it
        //will then move back to the front because of the lock constraint
        else if (phaserBody) {
            console.log("Edge is contacted to my body");
            this.edge.body.x = this.head.body.x;
            this.edge.body.y = this.head.body.y;
        }
        // 그 외에는 머리를 단순히 재설정하기 위해 머리의 중심으로 이동시킴
    },
    /**
     * Add callback for when snake is destroyed
     * @param  {Function} callback Callback function
     * @param  {Object}   context  context of callback
     */
    addDestroyedCallback: function(callback, context) {
        this.onDestroyedCallbacks.push(callback);
        this.onDestroyedContexts.push(context);
    }
};