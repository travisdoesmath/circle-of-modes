data = createData()

    var audio = document.getElementById('notes');
    var segmentEnd;
    var audioQueue = [];

    audio.addEventListener('timeupdate', function (){
        if (segmentEnd && audio.currentTime >= segmentEnd) {
            audio.pause();
            audioQueue.shift();
            if (audioQueue.length > 0) playSegments();
        }   
        console.log(audio.currentTime);
    }, false);

    function playSegments(){
        segmentEnd = audioQueue[0][1];
        audio.currentTime = audioQueue[0][0];
        audio.play();
    }

    function play(notes) {
        noteTimes = {
            'C1' : [0, 0.25],
            'C♯1': [0.8, 1.25],
            'D♭1': [0.8, 1.25],
            'D1' : [1.8, 2.25],
            'D♯1': [2.8, 3.25],
            'E♭1': [2.8, 3.25],
            'E1' : [3.8, 4.25],
            'F♭1': [3.8, 4.25],
            'E♯1': [4.8, 5.25],
            'F1' : [4.8, 5.25],
            'F♯1': [5.8, 6.25],
            'G♭1': [5.8, 6.25],
            'G1' : [6.8, 7.25],
            'G♯1': [7.8, 8.25],
            'A♭1': [7.8, 8.25],
            'A1' : [8.8, 9.25],
            'A♯1': [9.8, 10.25],
            'B♭1': [9.8, 10.25],
            'B1' : [10.8, 11.25],
            'C♭1': [10.8, 11.25],
            'B♯1': [11.8, 12.25],           

            'C2' : [11.8, 12.25],
            'C♯2': [12.8, 13.25],
            'D♭2': [12.8, 13.25],
            'D2' : [13.8, 14.25],
            'D♯2': [14.8, 15.25],
            'E♭2': [14.8, 15.25],
            'E2' : [15.8, 16.25],
            'F♭2': [15.8, 16.25],
            'E♯2': [16.8, 17.25],
            'F2' : [16.8, 17.25],
            'F♯2': [17.8, 18.25],
            'G♭2': [17.8, 18.25],
            'G2' : [18.8, 19.25],
            'G♯2': [19.8, 20.25],
            'A♭2': [19.8, 20.25],
            'A2' : [20.8, 21.25],
            'A♯2': [21.8, 22.25],
            'B♭2': [21.8, 22.25],
            'B2' : [22.8, 23.25],
            'C♭2': [22.8, 23.25],
            'B♯2': [23.8, 24.25],           

        }
        notes.forEach(n => audioQueue.push(noteTimes[n]))

        playSegments();
    }

    // d3.select('.modeNotes').on('click', e => {
    //     play(['C1','D1','E1','F1'])
    // })


let svg = d3.select("svg"),
    defs = svg.append('defs'),
    g = svg.append('g'),
	width = +svg.attr("width"),
	height = +svg.attr("height")
	bg = g.append("g").attr("transform", "translate(" + width*.5 + "," + height*.5 + ")");
    fg = g.append("g").attr("transform", "translate(" + width*.5 + "," + height*.5 + ")");
    controlsG = svg.append('g').attr("transform", "translate(" + width*.5 + "," + height*.5 + ")");

diagStripes = defs.append('pattern')
    .attr('id', 'diag-stripes')
    .attr('height', 8)
    .attr('width', 8)
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('patternTransform','rotate(45)')

diagStripes.append('rect')
    .attr('width', 8)
    .attr('height', 8)
    .attr('fill', '#BBB')
    .attr('transform','translate(0,0)')


diagStripes.append('rect')
    .attr('width', 4)
    .attr('height', 8)
    .attr('fill','white')
    // .attr('opacity', 0.5)
    .attr('transform','translate(0,0)')

defs.append('mask')
    .attr('id', 'diag-stripes-mask')
    .attr('width', 2)
    .attr('height', 2)
    .append('rect')
    .attr('width', 1000)
    .attr('height', 1000)
    .attr('y', -500)
    .attr('fill', 'url(#diag-stripes)')

let arc = d3.arc()

modeOrders = {
    'brightness': n => {
        return {
            'Locrian':-3,
            'Phrygian':-2,
            'Aeolian':-1,
            'Dorian':0,
            'Mixolydian':1,
            'Ionian':2,
            'Lydian':3
        }[n]},
    'degree': n => {
        return {
            'Ionian':-3,
            'Dorian':-2,
            'Phrygian':-1,
            'Lydian':0,
            'Mixolydian':1,
            'Aeolian':2,
            'Locrian':3
        }[n]}
}

noteOrders = {
    'parallel':{
        'fifths': n => {
            return {
                2 : 0, // D 
                9 : 1, // A
                4 : 2, // E
                11: 3, // B
                6 : 4, // F♯/G♭
                1 : 5, // C♯/D♭
                8 : 6, // G♯/A♭
                7 : 11, // G
                0 : 10, // C
                5 : 9, // F
                10: 8, // A♯/B♭
                3 : 7, // D♯/E♭
            }[n]
        },
        'chromatic': n => n
    },
    'relative': {
        'fifths': n => n,
        'chromatic': n => {
        return {
            '0'  : 0, 
            '-5' : 1, 
            '2'  : 2, 
            '-3' : 3,
            '4'  : 4, 
            '-1' : 5, 
            '6'  : 6,
            '1'  : 7, 
            '-4' : 8, 
            '3'  : 9,
            '-2' : 10, 
            '5'  : 11, 
            }[n]
        }
    }
}

rotation = 0;

let state = {
    noteOrder: 'fifths',
    modeOrder: 'brightness',
    modeGrouping: 'parallel',
    accidentals: 'flats'
}

selected = data.filter(d => d.root == 'D' && d.mode == 'Dorian')

modeOrder = modeOrders[state.modeOrder]
noteOrder = noteOrders[state.modeGrouping][state.noteOrder]

let rScale = d3.scaleLinear().domain([-3,3]).range([0.3 * Math.min(height/2, width/2), 0.9 * Math.min(height/2, width/2)])
let rScale2 = d3.scaleLinear().domain([-3,3]).range([0.2, 0.65])
let rScale3 = d3.scaleLinear().domain([-3,3]).range([4, 8])
let aScale = d3.scaleLinear().domain([0, 12]).range([0, 2 * Math.PI])

init()

function init() {
    let dToArcData = d => { return {
        'innerRadius': rScale(modeOrder(d.mode) - 0.5),
        'outerRadius': rScale(modeOrder(d.mode) + 0.5),
        'startAngle' : 0,
        'endAngle'   : aScale((state.modeGrouping == 'relative' ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) + 0.5) 
                    - aScale((state.modeGrouping == 'relative' ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) - 0.5),
    }}

    let rotate = d => `rotate(${mod(aScale((state.modeGrouping == 'relative' ? noteOrder(d.notes[0].accidentals): noteOrder(d.rootNote)) - 0.5) * 180 / Math.PI, 360)})`

    wedges = bg.selectAll('.wedgeGroup').data(data).enter().append('g').attr('class','wedgeGroup')
        .attr('transform', rotate)

    wedges.append('path')
        .attr('class','wedge')
        .attr('d', d => arc(dToArcData(d)))
        .attr('fill', 'white')

    wedges.append('path')
        .attr('class','wedge')
        .attr('d', d => arc(dToArcData(d)))
        .attr('fill', d => d3.hcl(d.rootNote * 30 + modeOrder(d.mode) * 30/7 - 30, 80, 100 * rScale2(modeOrder(d.mode))))
        .attr('mask', d => d.notes[0].accidentals === 0 ? "url(#diag-stripes-mask)" : "")
        .on('click', (e, d) => {
            if (selected.some(x => x.root == d.root && x.mode == d.mode)) {
                selected = selected.filter(x => x.root != d.root || x.mode != d.mode)
            } else {
                selected.push(d)
            }
            drawSelected()
        })

    wedges.append('path')
        .attr('id', d => `text-path-1-${d.root}-${d.mode}`)
        .attr('class','textPath1')
        .attr('d', d => {
            let r = rScale(modeOrder(d.mode));
            let theta = aScale((state.modeGrouping == 'relative' ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) + 0.5) 
                    - aScale((state.modeGrouping == 'relative' ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) - 0.5);
            let l = r * Math.sqrt(2 - 2 * Math.cos(theta))
            return `M0,0 a${rScale(modeOrder(d.mode))},${rScale(modeOrder(d.mode))},0,0,1,${l},0`
        })
        .attr('transform', d => `translate(0,${-rScale(modeOrder(d.mode))}) 
                                rotate(${(aScale((state.modeGrouping == 'relative' ? d.notes[0].accidentals : noteOrder(d.rootNote))) 
                                        - aScale((state.modeGrouping == 'relative' ? d.notes[0].accidentals : noteOrder(d.rootNote)) - 0.5)) * 180 / Math.PI})`)

    wedges.append('path')
        .attr('id', d => `text-path-2-${d.root}-${d.mode}`)
        .attr('class','textPath2')
        .attr('d', d => {
            let r = rScale(modeOrder(d.mode) - 0.33);
            let theta = aScale((state.modeGrouping == 'relative' ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) + 0.5) 
                    - aScale((state.modeGrouping == 'relative' ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) - 0.5);
            let l = r * Math.sqrt(2 - 2 * Math.cos(theta))
            return `M0,0 a${rScale(modeOrder(d.mode))},${rScale(modeOrder(d.mode))},0,0,1,${l},0`
        })
        .attr('transform', d => {
            let r = rScale(modeOrder(d.mode) - 0.33);
            return `translate(0,${-r}) rotate(${(aScale((state.modeGrouping == 'relative' ? d.notes[0].accidentals : noteOrder(d.rootNote))) 
                                            - aScale((state.modeGrouping == 'relative' ? d.notes[0].accidentals : noteOrder(d.rootNote)) - 0.5)) * 180 / Math.PI})`
        })


    wedges.append('text')
        .attr('text-anchor', 'middle')
        .append('textPath')
        .attr('href', d => `#text-path-1-${d.root}-${d.mode}`)
        .attr('startOffset','50%')
        .attr('font-size', '.8em')
        .style('fill', d => d3.hcl(d.rootNote * 30 + modeOrder(d.mode) * 30/7 - 30, 50, 100 + 100 * rScale2(modeOrder(d.mode))))
        .text(d => `${d.root} ${d.mode}`)

    wedges.append('text')
        .attr('text-anchor', 'middle')
        .append('textPath')
        .attr('href', d => `#text-path-2-${d.root}-${d.mode}`)
        .attr('startOffset','50%')
        .attr('font-size', '.8em')
        .attr('dy', '1.2em')
        .style('fill', d => d3.hcl(d.rootNote * 30 + modeOrder(d.mode) * 30/7 - 30, 50, 100 + 100 * rScale2(modeOrder(d.mode))))
        .text(d => {
            _ = x => x > 0 ? `${x} ♯` : x < 0 ? `${-x} ♭` : `♮`
            if (d.notes.length == 1) return _(d.notes[0].accidentals)
            else return '6 ♯ / 6 ♭'
        })

    drawSelected()
    addControls()
}

function addControls() {
    ccwRotateArrow = controlsG.append('g')
        .attr('class','rotate-arrow')
        .attr('transform', 'rotate(-37.5)')

    ccwRotateArrow.append('path')
        .attr('d', d3.arc()
                    .innerRadius(rScale(3.5))
                    .outerRadius(rScale(5.25))
                    .startAngle(-1/24 * Math.PI)
                    .endAngle(3/24 * Math.PI )
        )
        .style('opacity', 0)

    ccwRotateArrow.append('path')
        .attr('d', d3.arc()
                    .innerRadius(rScale(4.25))
                    .outerRadius(rScale(4.5))
                    .startAngle(0)
                    .endAngle(2/24 * Math.PI )
        )

    ccwRotateArrow.append('path')
        .attr('d', d => `M1,${-rScale(4.375)} L 1, ${-rScale(4.375)-15} L-15,${-rScale(4.375)} L1,${-rScale(4.375)+15} L 1,${-rScale(4.375)}`)

    cwRotateArrow = controlsG.append('g')
        .attr('class','rotate-arrow')
        .attr('transform', 'rotate(37.5)')
        
    cwRotateArrow.append('path')
        .attr('d', d3.arc()
                    .innerRadius(rScale(3.5))
                    .outerRadius(rScale(5.25))
                    .startAngle(-3/24 * Math.PI)
                    .endAngle(1/24 * Math.PI )
        )
        .style('opacity', 0)

    cwRotateArrow.append('path')
        .attr('d', d3.arc()
                    .innerRadius(rScale(4.25))
                    .outerRadius(rScale(4.5))
                    .startAngle(-2/24 * Math.PI )
                    .endAngle(0)
        )

    cwRotateArrow.append('path')
        .attr('d', d => `M-1,${-rScale(4.375)} L -1, ${-rScale(4.375)-15} L15,${-rScale(4.375)} L-1,${-rScale(4.375)+15} L -1,${-rScale(4.375)}`)

    ccwRotateArrow.on('click', e => rotateUpdate(-1))
    cwRotateArrow.on('click', e => rotateUpdate(1))

    d3.selectAll('.switch input').on('click', function(e) {
        if (this.id == 'note-order-chromatic') { state.noteOrder ='chromatic'; update() }
        if (this.id == 'note-order-fifths') { state.noteOrder = 'fifths'; update() }
        if (this.id == 'mode-order-degree') { state.modeOrder = 'degree'; update() }
        if (this.id == 'mode-order-brightness') { state.modeOrder = 'brightness'; update() }
        if (this.id == 'mode-grouping-parallel') { state.modeGrouping = 'parallel'; update() }
        if (this.id == 'mode-grouping-relative') { state.modeGrouping = 'relative'; update() }
        if (this.id == 'accidentals-flats') { state.accidentals = 'flats'; drawSelected() }
        if (this.id == 'accidentals-sharps') { state.accidentals = 'sharps'; drawSelected() }

    })
}

function drawSelected() {
    modeOrder = modeOrders[state.modeOrder]
    noteOrder = noteOrders[state.modeGrouping][state.noteOrder]

    let dToArcData = d => { return {
        'innerRadius': rScale(modeOrder(d.mode) - 0.5),
        'outerRadius': rScale(modeOrder(d.mode) + 0.5),
        'startAngle' : 0,
        'endAngle'   : aScale((state.modeGrouping == 'relative' ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) + 0.5) 
                     - aScale((state.modeGrouping == 'relative' ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) - 0.5),
    }}

    let rotate = d => `rotate(${Math.round(aScale((state.modeGrouping == 'relative' ? noteOrder(d.notes[0].accidentals): noteOrder(d.rootNote)) + rotation - 0.5) * 180 / Math.PI)})`


    outlineWedges = fg.selectAll('.wedge-outline').data(selected)
    
    outlineWedges.enter()
        .append('path')
        .attr('class','wedge-outline')
        .merge(outlineWedges)
        .attr('d', d => arc(dToArcData(d)))
        .style('fill', 'none')
        .style('stroke', 'white')
        .style('stroke-width', d => rScale3(modeOrder(d.mode)))
        .attr('transform', d => rotate(d))

    outlineWedges.exit().remove()

    modeNotes = d3.select('#selectedModes').selectAll('.modeNotes').data(selected)

    modeNotes.enter().append('li')
    .attr('class', 'modeNotes')
    .merge(modeNotes)
    .text(d => {
        let notes = d.notes[0];
        if (d.notes.length > 1) {
            if (state.accidentals == 'flats') {
                notes = d.notes.filter(x => x.accidentals < 0)[0]
            } else if (state.accidentals == 'sharps') {
                notes = d.notes.filter(x => x.accidentals > 0)[0]
            }
        }
        return `${d.root} ${d.mode}: ${notes.names.join(' - ')} - ${notes.names[0]}`;
    })
    .style('cursor', 'pointer')
    .on('click', (e, d) => {
        if (audioQueue.length == 0) {
            octave = 1
            notes = []
            for (let i = 0; i < 8; i++) {
                if (d.notes[0].names[i % 7][0] == 'C' && i != 0) octave += 1
                notes.push(`${d.notes[0].names[i % 7]}${octave}`)
            }
            play(notes)
        }
    })

    modeNotes.exit().remove()

    if (document.getElementById('selectedModes').childElementCount == 1) {
        d3.select('#noModeSelected')
            .style('display', 'block')
    } else {
        d3.select('#noModeSelected')
            .style('display', 'none')
    }
}

function rotateUpdate(direction) {
    rotation += mod(direction,12);   
    update(duration = 150, fadeText = false)
}

function update(duration = 1000, fadeText = true) {
    modeOrder = modeOrders[state.modeOrder]
    noteOrder = noteOrders[state.modeGrouping][state.noteOrder]

    let rotate = d => `rotate(${Math.round(aScale((state.modeGrouping == 'relative' ? noteOrder(d.notes[0].accidentals): noteOrder(d.rootNote)) + rotation - 0.5) * 180 / Math.PI)})`

    let dToArcData = d => { return {
        'innerRadius': rScale(modeOrder(d.mode) - 0.5),
        'outerRadius': rScale(modeOrder(d.mode) + 0.5),
        'startAngle' : 0,
        'endAngle'   : aScale((state.modeGrouping == 'relative' ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) + 0.5) 
                     - aScale((state.modeGrouping == 'relative' ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) - 0.5),
    }}

    wedges = bg.selectAll('.wedgeGroup').data(data)
    
    textDelay = 0
    
    if (fadeText) {
        wedges.selectAll('text')
        .style('opacity', 1)
        .transition()
        .delay((d, i) => {
            return (13 * d.rootNote) + 21 * (modeOrder(d.mode)) 
        })
        .duration(300)
        .style('opacity', 0)
        .transition()
        .delay(duration - (10 * 12 + 16 * 7))
        .transition()
        .duration(500)
        .style('opacity', 1)
        textDelay = 500
    }


    wedges.transition()
    .delay(textDelay)
    .duration(duration)
    .attrTween('transform', function(d) {
        let a = parseFloat(this.getAttribute("transform").split('(')[1].split(')')[0]) % 360
        let b = Math.round(aScale((state.modeGrouping == 'relative' ? noteOrder(d.notes[0].accidentals): noteOrder(d.rootNote)) - 0.5 + rotation) * 180 / Math.PI) % 360
        if (a - b > 180) b += 360; else if (b - a > 180) a += 360
        if (Math.abs(a - b) % 180 < 1) {
            while (a < b) {
                a += 360
            }
        }
        return d3.interpolateString(`rotate(${a})`, `rotate(${b})`)
    })
                            
    wedges.selectAll('.wedge').transition()
    .delay(textDelay)
    .duration(duration)
    .attr('d', d => arc(dToArcData(d))) 

    wedges.select('.textPath1')
    .transition()
    .delay(textDelay)
    .duration(duration)
    .attr('d', d => {
        let r = rScale(modeOrder(d.mode));
        let theta = aScale((state.modeGrouping == 'relative' ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) + 0.5) 
                  - aScale((state.modeGrouping == 'relative' ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) - 0.5);
        let l = r * Math.sqrt(2 - 2 * Math.cos(theta))
        return `M0,0 a${rScale(modeOrder(d.mode))},${rScale(modeOrder(d.mode))},0,0,1,${l},0`
    })
    .attr('transform', d => `translate(0,${-rScale(modeOrder(d.mode))}) rotate(${(aScale((state.modeGrouping == 'relative' ? d.notes[0].accidentals : noteOrder(d.rootNote))) 
                                                                                - aScale((state.modeGrouping == 'relative' ? d.notes[0].accidentals : noteOrder(d.rootNote)) - 0.5)) * 180 / Math.PI})`)

    wedges.select('.textPath2')
    .transition()
    .delay(textDelay)
    .duration(duration)
    .attr('d', d => {
        let r = rScale(modeOrder(d.mode) - 0.33);
        let theta = aScale((state.modeGrouping == 'relative' ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) + 0.5) 
                  - aScale((state.modeGrouping == 'relative' ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) - 0.5);
        let l = r * Math.sqrt(2 - 2 * Math.cos(theta))
        return `M0,0 a${rScale(modeOrder(d.mode))},${rScale(modeOrder(d.mode))},0,0,1,${l},0`
    })
    .attr('transform', d => {
        let r = rScale(modeOrder(d.mode) - 0.33);
        return `translate(0,${-r}) rotate(${(aScale((state.modeGrouping == 'relative' ? d.notes[0].accidentals : noteOrder(d.rootNote))) 
                                           - aScale((state.modeGrouping == 'relative' ? d.notes[0].accidentals : noteOrder(d.rootNote)) - 0.5)) * 180 / Math.PI})`
    })

    outlineWedges = fg.selectAll('.wedge-outline').data(selected)

    outlineWedges.transition()
    .delay(textDelay)
    .duration(duration)
    .attr('d', d => arc(dToArcData(d)))
    .attr('transform', rotate)
}