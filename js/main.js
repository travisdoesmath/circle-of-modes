mod = (v, n) => ((v % n) + n) % n

modeNames = ['Ionian','Dorian','Phrygian','Lydian','Mixolydian','Aeolian','Locrian']
majorSteps = [0, 2, 4, 5, 7, 9, 11];

modes = {}
for (let i = 0; i < 7; i++) {
    modes[modeNames[i]] = (majorSteps.concat(majorSteps)).slice(i, i + 7).map(x => {_ = x - majorSteps[i]; return (_ < 0 ? 12 + _ : _) % 12})
}

function getModeNoteNames(startingNote, mode) {
    modeNotes = modes[mode].map(x => (x + startingNote) % 12)

    map1 = {
        0: 'C',
        2: 'D',
        4: 'E',
        5: 'F',
        7: 'G',
        9: 'A',
        11: 'B'
    }

    map2 = {}
    for (k in map1) {
        map2[map1[k]] = +k
    }
        
    function nextBaseNote(note) {
        let notes = noteLetters = 'CDEFGAB'
        let noteIndex = noteLetters.indexOf(note)
        return notes[(noteIndex + 1) % notes.length]
    }

    function _(sharp, offset) {
        if (sharp) {
            baseNote = map1[mod(startingNote - offset, 12)] ? map1[mod(startingNote - offset, 12)] : map1[mod(startingNote - (offset - 1), 12)]
            accidentals = startingNote - map2[baseNote]
            if (accidentals < 0) accidentals = accidentals + 12
            notes = [{'baseNote': baseNote, 'accidental': accidentals}]
            for (let i = 1; i < 7; i++) {
                baseNote = nextBaseNote(baseNote)
                accidental = mod(modeNotes[i] - map2[baseNote], 12)
                if (accidental < 0) accidental = accidental + 12
                notes.push({'baseNote': baseNote, 'accidental': accidental})
                accidentals += accidental
            }
        } else {
            baseNote = map1[(startingNote + offset) % 12] ? map1[(startingNote + offset) % 12] : map1[(startingNote + (offset - 1)) % 12]
            accidentals = startingNote - map2[baseNote]
            if (accidentals > 0) accidentals = accidentals - 12
            notes = [{'baseNote': baseNote, 'accidental': accidentals}]
            for (let i = 1; i < 7; i++) {
                baseNote = nextBaseNote(baseNote)
                accidental = (modeNotes[i] - map2[baseNote]) % 12
                if (accidental > 0) accidental = accidental - 12
                accidentals += accidental
                notes.push({'baseNote': baseNote, 'accidental':accidental})
            }
        }

        return {'notes': notes, 'accidentals': accidentals}
    }

    sharps1 = _(true, 2)
    sharps2 = _(true, 1)
    sharps3 = _(true, 0)
    flats0 = _(false, 0)
    flats1 = _(false, 1)
    flats2 = _(false, 2)

    bestSharp = [sharps1, sharps2, sharps3].sort((a, b) => Math.abs(a.accidentals) - Math.abs(b.accidentals))[0]
    bestFlat = [flats0, flats1, flats2].sort((a, b) => Math.abs(a.accidentals) - Math.abs(b.accidentals))[0]

    function formatNotes(a) {
        let notes = a.notes.map(x => x.baseNote + (x.accidental == 0 ? '' : x.accidental > 0 ? '♯'.repeat(x.accidental) : '♭'.repeat(-x.accidental)))
        return {'names': notes, 'accidentals': a.accidentals}
    }

    let outObject = {'mode':mode, 'rootNote':startingNote, 'selected': false}

    if (bestSharp.accidentals < -bestFlat.accidentals || bestSharp.accidentals == 0) {
        outObject.notes = [formatNotes(bestSharp)]
        outObject.root = outObject.notes[0].names[0]
    }
    else if (bestSharp.accidentals > -bestFlat.accidentals) {
        outObject.notes = [formatNotes(bestFlat)]
        outObject.root = outObject.notes[0].names[0]
    }
    else {
        outObject.notes = [bestSharp, bestFlat].map(x => formatNotes(x)) 
        outObject.root = `${outObject.notes[0].names[0]} / ${outObject.notes[1].names[0]}`
    }

    return outObject
}

data = []

for (let i = 0; i < 12; i++) {
    modeNames.forEach(mode => {
        data.push(getModeNoteNames(i, mode))
    })
}


let svg = d3.select("svg"),
    defs = svg.append('defs'),
    g = svg.append('g'),
	width = +svg.attr("width"),
	height = +svg.attr("height")
	bg = g.append("g").attr("transform", "translate(" + width*.5 + "," + height*.5 + ")");
    fg = g.append("g").attr("transform", "translate(" + width*.5 + "," + height*.5 + ")");
    controlsG = svg.append('g').attr("transform", "translate(" + width*.5 + "," + height*.5 + ")");

defs.append('pattern')
    .attr('id', 'diagonalHatch')
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', 4)
    .attr('height', 4)
  .append('path')
    .attr('d', 'M-1,1l2,-2M0,4l4,-4M3,5l2,-2')
    .style('stroke','white')
    .style('stroke-width', 1)

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
    // .attr('opacity', 0.5)
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
    // .attr('fill', 'url(#diagonalHatch)')


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
    modeGrouping: 'parallel'
}

selected = data.filter(d => d.root == 'D' && d.mode == 'Dorian')

modeOrder = modeOrders[state.modeOrder]
noteOrder = noteOrders[state.modeGrouping][state.noteOrder]

let rScale = d3.scaleLinear().domain([-3,3]).range([0.3 * Math.min(height/2, width/2), 0.9 * Math.min(height/2, width/2)])
let rScale2 = d3.scaleLinear().domain([-3,3]).range([0.2, 0.65])
let rScale3 = d3.scaleLinear().domain([-3,3]).range([4, 8])
let aScale = d3.scaleLinear().domain([0, 12]).range([0, 2 * Math.PI])

let dToArcData = d => { return {
    'innerRadius': rScale(modeOrder(d.mode) - 0.5),
    'outerRadius': rScale(modeOrder(d.mode) + 0.5),
    'startAngle' : 0,
    'endAngle'   : aScale((state.modeGrouping == 'relative' ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) + 0.5) 
                 - aScale((state.modeGrouping == 'relative' ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) - 0.5),
}}

//let rotate = d => `rotate(${aScale((relative ? (d.notes[0].accidentals + noteOrder(d.rootNote)) : noteOrder(d.rootNote)) - 0.5) * 180 / Math.PI})`
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


// wedges.append('path')
//     .attr('id', d => `text-path-1-${d.root}-${d.mode}`)
//     .attr('class','textPath1')
//     .attr('d', d => {
//         let arcData = dToArcData(d);
//         arcData.innerRadius = rScale(modeOrder(d.mode))
//         arcData.outerRadius = rScale(modeOrder(d.mode))
//         return arc(arcData)
//     })

wedges.append('path')
    .attr('id', d => `text-path-1-${d.root}-${d.mode}`)
    .attr('class','textPath1')
    //.attr('d', d => `M0,${-rScale(modeOrder(d.mode))} A${rScale(modeOrder(d.mode))},${rScale(modeOrder(d.mode))},0,0,1,`)    
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
    // .attr('d', d => {
    //     let arcData = dToArcData(d);
    //     arcData.innerRadius = rScale(modeOrder(d.mode) - 0.33)
    //     arcData.outerRadius = rScale(modeOrder(d.mode) - 0.33)
    //     return arc(arcData)
    // })
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
    // .attr('transform', d => {
    //     let centroid = arc.centroid(dToArcData(d));
    //     return `translate(${centroid[0]},${centroid[1]}) rotate(${(aScale((relative ? d.notes[0].accidentals : noteOrder(d.rootNote))) - aScale((relative ? d.notes[0].accidentals : noteOrder(d.rootNote)) - 0.5)) * 180 / Math.PI})`;
    // })
    .attr('font-size', '.8em')
    .style('fill', d => d3.hcl(d.rootNote * 30 + modeOrder(d.mode) * 30/7 - 30, 50, 100 + 100 * rScale2(modeOrder(d.mode))))
    .text(d => `${d.root} ${d.mode}`)

wedges.append('text')
    .attr('text-anchor', 'middle')
    // .attr('transform', d => {
    //     let centroid = arc.centroid(dToArcData(d));
    //     return `translate(${centroid[0]},${centroid[1]}) rotate(${(aScale((relative ? d.notes[0].accidentals : noteOrder(d.rootNote))) - aScale((relative ? d.notes[0].accidentals : noteOrder(d.rootNote)) - 0.5)) * 180 / Math.PI})`;
    // })
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
    // .style('fill', '#EDD')

ccwRotateArrow.append('path')
    .attr('d', d => `M1,${-rScale(4.375)} L 1, ${-rScale(4.375)-15} L-15,${-rScale(4.375)} L1,${-rScale(4.375)+15} L 1,${-rScale(4.375)}`)
    // .style('fill', '#EDD')


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
    // .style('fill', '#DDE')

cwRotateArrow.append('path')
    .attr('d', d => `M-1,${-rScale(4.375)} L -1, ${-rScale(4.375)-15} L15,${-rScale(4.375)} L-1,${-rScale(4.375)+15} L -1,${-rScale(4.375)}`)
    // .style('fill', '#DDE')


ccwRotateArrow.on('click', e => rotateAnimate(-1))
cwRotateArrow.on('click', e => rotateAnimate(1))

// controlsG.append('circle')
//     .attr('cx', 0)
//     .attr('cy', 0)
//     .attr('r', rScale(3.5))
//     //.attr('fill', 'none')
//     .attr('opacity', 0)
//     .on('click', e => {
//         states = states.concat(states).slice(1, states.length+1)

//         state = states[0]

//         animate(state)
//     })

drawSelected()

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

    modeNotes.enter()
    .append('li')
    .attr('class', 'modeNotes')
    .merge(modeNotes)
    .text(d => `${d.root} ${d.mode}: ${d.notes[0].names.join(' - ')}`)

    modeNotes.exit().remove()
}

function rotateAnimate(direction) {

    rotation += mod(direction,12);
    
    animate(state, duration = 150, fadeText = false)
}

d3.selectAll('.switch input').on('click', function(e) {
    if (this.id == 'note-order-chromatic') state.noteOrder ='chromatic'
    if (this.id == 'note-order-fifths') state.noteOrder = 'fifths'
    if (this.id == 'mode-order-degree') state.modeOrder = 'degree'
    if (this.id == 'mode-order-brightness') state.modeOrder = 'brightness'
    if (this.id == 'mode-grouping-parallel') state.modeGrouping = 'parallel'
    if (this.id == 'mode-grouping-relative') state.modeGrouping = 'relative'

    animate(state)
})

function animate(state, duration = 1000, fadeText = true) {
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
        // .transition()
        // .duration(0)
        // .style('display', 'none')
        .transition()
        // .delay((d, i) => {
        //     return duration -100 + (5 * d.rootNote) + 8 * (modeOrder(d.mode)) 
        // })
        .delay(duration - (10 * 12 + 16 * 7))
        // .duration(0)   
        // .style('display', 'block')
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

    // wedges.selectAll('text').transition()
    //     .duration(duration)
    //     .attr('transform', d => {
    //     let centroid = arc.centroid(dToArcData(d));
    //     return `translate(${centroid[0]},${centroid[1]}) rotate(${(aScale((relative ? d.notes[0].accidentals : noteOrder(d.rootNote))) - aScale((relative ? d.notes[0].accidentals : noteOrder(d.rootNote)) - 0.5)) * 180 / Math.PI})`;})

    outlineWedges = fg.selectAll('.wedge-outline').data(selected)

    outlineWedges.transition()
    .delay(textDelay)
    .duration(duration)
    .attr('d', d => arc(dToArcData(d)))
    .attr('transform', rotate)
}

// test = getModeNoteNames(8, 'Dorian')
// console.log(test)

// test = getModeNoteNames(4, 'Locrian')