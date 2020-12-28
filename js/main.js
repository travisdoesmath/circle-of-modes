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

    let outObject = {'mode':mode, 'rootNote':startingNote}

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


let svg = d3.select("svg")
	width = +svg.attr("width"),
	height = +svg.attr("height")
	bg = svg.append("g").attr("transform", "translate(" + width*.5 + "," + height*.5 + ")");
    fg = svg.append("g").attr("transform", "translate(" + width*.5 + "," + height*.5 + ")");

let arc = d3.arc()

modeOrders = [
    {
        'Locrian':-3,
        'Phrygian':-2,
        'Aeolian':-1,
        'Dorian':0,
        'Mixolydian':1,
        'Ionian':2,
        'Lydian':3
    },
    {
        'Ionian':-3,
        'Dorian':-2,
        'Phrygian':-1,
        'Lydian':0,
        'Mixolydian':1,
        'Aeolian':2,
        'Locrian':3
    }
]

noteOrders = [
    n => {
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
    n => n,
    n => {
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
]


states = [
    {modeOrder: modeOrders[0], noteOrder: noteOrders[0], relative: false},
    {modeOrder: modeOrders[1], noteOrder: noteOrders[0], relative: false},
    {modeOrder: modeOrders[1], noteOrder: noteOrders[1], relative: true},
    {modeOrder: modeOrders[0], noteOrder: noteOrders[1], relative: true},
    {modeOrder: modeOrders[0], noteOrder: noteOrders[2], relative: true},
    {modeOrder: modeOrders[0], noteOrder: noteOrders[1], relative: false},
]

modeOrder = states[0].modeOrder
noteOrder = states[0].noteOrder
relative = states.relative;

let rScale = d3.scaleLinear().domain([-3,3]).range([0.3 * Math.min(height/2, width/2), 0.9 * Math.min(height/2, width/2)])
let rScale2 = d3.scaleLinear().domain([-3,3]).range([0.2, 0.65])
let rScale3 = d3.scaleLinear().domain([-3,3]).range([4, 8])
let aScale = d3.scaleLinear().domain([0, 12]).range([0, 2 * Math.PI])

let dToArcData = d => { return {
    'innerRadius': rScale(modeOrder[d.mode] - 0.5),
    'outerRadius': rScale(modeOrder[d.mode] + 0.5),
    'startAngle' : 0,
    'endAngle'   : aScale((relative ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) + 0.5) - aScale((relative ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) - 0.5),
}}

//let rotate = d => `rotate(${aScale((relative ? (d.notes[0].accidentals + noteOrder(d.rootNote)) : noteOrder(d.rootNote)) - 0.5) * 180 / Math.PI})`
let rotate = d => `rotate(${mod(aScale((relative ? noteOrder(d.notes[0].accidentals): noteOrder(d.rootNote)) - 0.5) * 180 / Math.PI, 360)})`

wedges = bg.selectAll('.wedge').data(data).enter().append('g').attr('class','wedge')
    .attr('transform', rotate)

wedges.append('path')
    .attr('d', d => arc(dToArcData(d)))
    .style('fill', d => d3.hcl(d.rootNote * 30 + modeOrder[d.mode] * 30/7 - 30, 80, 100 * rScale2(modeOrder[d.mode])))

// wedges.append('path')
//     .attr('id', d => `text-path-1-${d.root}-${d.mode}`)
//     .attr('class','textPath1')
//     .attr('d', d => {
//         let arcData = dToArcData(d);
//         arcData.innerRadius = rScale(modeOrder[d.mode])
//         arcData.outerRadius = rScale(modeOrder[d.mode])
//         return arc(arcData)
//     })

wedges.append('path')
    .attr('id', d => `text-path-1-${d.root}-${d.mode}`)
    .attr('class','textPath1')
    //.attr('d', d => `M0,${-rScale(modeOrder[d.mode])} A${rScale(modeOrder[d.mode])},${rScale(modeOrder[d.mode])},0,0,1,`)    
    .attr('d', d => {
        let r = rScale(modeOrder[d.mode]);
        let theta = aScale((relative ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) + 0.5) - aScale((relative ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) - 0.5);
        let l = r * Math.sqrt(2 - 2 * Math.cos(theta))
        return `M0,0 a${rScale(modeOrder[d.mode])},${rScale(modeOrder[d.mode])},0,0,1,${l},0`
    })
    .attr('transform', d => `translate(0,${-rScale(modeOrder[d.mode])}) rotate(${(aScale((relative ? d.notes[0].accidentals : noteOrder(d.rootNote))) - aScale((relative ? d.notes[0].accidentals : noteOrder(d.rootNote)) - 0.5)) * 180 / Math.PI})`)

wedges.append('path')
    .attr('id', d => `text-path-2-${d.root}-${d.mode}`)
    .attr('class','textPath2')
    // .attr('d', d => {
    //     let arcData = dToArcData(d);
    //     arcData.innerRadius = rScale(modeOrder[d.mode] - 0.33)
    //     arcData.outerRadius = rScale(modeOrder[d.mode] - 0.33)
    //     return arc(arcData)
    // })
    .attr('d', d => {
        let r = rScale(modeOrder[d.mode] - 0.33);
        let theta = aScale((relative ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) + 0.5) - aScale((relative ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) - 0.5);
        let l = r * Math.sqrt(2 - 2 * Math.cos(theta))
        return `M0,0 a${rScale(modeOrder[d.mode])},${rScale(modeOrder[d.mode])},0,0,1,${l},0`
    })
    .attr('transform', d => {
        let r = rScale(modeOrder[d.mode] - 0.33);
        return `translate(0,${-r}) rotate(${(aScale((relative ? d.notes[0].accidentals : noteOrder(d.rootNote))) - aScale((relative ? d.notes[0].accidentals : noteOrder(d.rootNote)) - 0.5)) * 180 / Math.PI})`
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
    .style('fill', d => d3.hcl(d.rootNote * 30 + modeOrder[d.mode] * 30/7 - 30, 50, 100 + 100 * rScale2(modeOrder[d.mode])))
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
    .style('fill', d => d3.hcl(d.rootNote * 30 + modeOrder[d.mode] * 30/7 - 30, 50, 100 + 100 * rScale2(modeOrder[d.mode])))
    .text(d => {
        _ = x => x > 0 ? `${x} ♯` : x < 0 ? `${-x} ♭` : `♮`
        if (d.notes.length == 1) return _(d.notes[0].accidentals)
        else return '6 ♯ / 6 ♭'
    })


outlineWedges = fg.selectAll('.wedge-outline').data(data.filter(d => d.notes[0].accidentals == 0)).enter().append('g')
outlineWedges.append('path')
    .attr('class','wedge-outline')
    .attr('d', d => arc(dToArcData(d)))
    .style('fill', 'none')
    .style('stroke', 'white')
    .style('stroke-width', d => rScale3(modeOrder[d.mode]))
    .attr('transform', d => rotate(d))

svg.on('click', e => {
    states = states.concat(states).slice(1, states.length+1)

    animate(states[0].modeOrder, states[0].noteOrder, states[0].relative)
})

function animate(modeOrder, noteOrder, relative, duration = 1000) {
    let rotate = d => `rotate(${Math.round(aScale((relative ? noteOrder(d.notes[0].accidentals): noteOrder(d.rootNote)) - 0.5) * 180 / Math.PI)})`

    let dToArcData = d => { return {
        'innerRadius': rScale(modeOrder[d.mode] - 0.5),
        'outerRadius': rScale(modeOrder[d.mode] + 0.5),
        'startAngle' : 0,
        'endAngle'   : aScale((relative ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) + 0.5) - aScale((relative ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) - 0.5),
    }}

    wedges = bg.selectAll('.wedge').data(data)
    
    
    wedges.selectAll('text')
    .style('opacity', 1)
    .transition()
    .delay((d, i) => {
        return (13 * d.rootNote) + 21 * (modeOrder[d.mode]) 
    })
    .duration(300)
    .style('opacity', 0)
    // .transition()
    // .duration(0)
    // .style('display', 'none')
    .transition()
    // .delay((d, i) => {
    //     return duration -100 + (5 * d.rootNote) + 8 * (modeOrder[d.mode]) 
    // })
    .delay(duration - (10 * 12 + 16 * 7))
    // .duration(0)   
    // .style('display', 'block')
    .transition()
    .duration(500)
    .style('opacity', 1)

    wedges.transition()
    .delay(500)
    .duration(duration)
    .attrTween('transform', function(d) {
        let a = parseFloat(this.getAttribute("transform").split('(')[1].split(')')[0]) % 360
        let b = Math.round(aScale((relative ? noteOrder(d.notes[0].accidentals): noteOrder(d.rootNote)) - 0.5) * 180 / Math.PI) % 360
        if (a - b > 180) b += 360; else if (b - a > 180) a += 360
        if (Math.abs(a - b) % 180 < 1) {
            while (a < b) {
                a += 360
            }
        }
        return d3.interpolateString(`rotate(${a})`, `rotate(${b})`)
    })
                            
    wedges.select('path').transition()
    .delay(500)
    .duration(duration)
    .attr('d', d => arc(dToArcData(d))) 

    wedges.select('.textPath1')
    .transition()
    .delay(500)
    .duration(duration)
    .attr('d', d => {
        let r = rScale(modeOrder[d.mode]);
        let theta = aScale((relative ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) + 0.5) - aScale((relative ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) - 0.5);
        let l = r * Math.sqrt(2 - 2 * Math.cos(theta))
        return `M0,0 a${rScale(modeOrder[d.mode])},${rScale(modeOrder[d.mode])},0,0,1,${l},0`
    })
    .attr('transform', d => `translate(0,${-rScale(modeOrder[d.mode])}) rotate(${(aScale((relative ? d.notes[0].accidentals : noteOrder(d.rootNote))) - aScale((relative ? d.notes[0].accidentals : noteOrder(d.rootNote)) - 0.5)) * 180 / Math.PI})`)

    wedges.select('.textPath2')
    .transition()
    .delay(500)
    .duration(duration)
    .attr('d', d => {
        let r = rScale(modeOrder[d.mode] - 0.33);
        let theta = aScale((relative ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) + 0.5) - aScale((relative ? noteOrder(d.notes[0].accidentals) : noteOrder(d.rootNote)) - 0.5);
        let l = r * Math.sqrt(2 - 2 * Math.cos(theta))
        return `M0,0 a${rScale(modeOrder[d.mode])},${rScale(modeOrder[d.mode])},0,0,1,${l},0`
    })
    .attr('transform', d => {
        let r = rScale(modeOrder[d.mode] - 0.33);
        return `translate(0,${-r}) rotate(${(aScale((relative ? d.notes[0].accidentals : noteOrder(d.rootNote))) - aScale((relative ? d.notes[0].accidentals : noteOrder(d.rootNote)) - 0.5)) * 180 / Math.PI})`
    })

    // wedges.selectAll('text').transition()
    //     .duration(duration)
    //     .attr('transform', d => {
    //     let centroid = arc.centroid(dToArcData(d));
    //     return `translate(${centroid[0]},${centroid[1]}) rotate(${(aScale((relative ? d.notes[0].accidentals : noteOrder(d.rootNote))) - aScale((relative ? d.notes[0].accidentals : noteOrder(d.rootNote)) - 0.5)) * 180 / Math.PI})`;})

    outlineWedges = fg.selectAll('.wedge-outline').data(data.filter(d => d.notes[0].accidentals == 0))

    outlineWedges.transition()
    .delay(500)
    .duration(duration)
    .attr('d', d => arc(dToArcData(d)))
    .attr('transform', rotate)
}

// test = getModeNoteNames(8, 'Dorian')
// console.log(test)

// test = getModeNoteNames(4, 'Locrian')