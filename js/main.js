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
modeNames.forEach(mode => {
    for (let i = 0; i < 12; i++) {
        data.push(getModeNoteNames(i, mode))
    }
})

let svg = d3.select("svg")
	width = +svg.attr("width"),
	height = +svg.attr("height")
	bg = svg.append("g").attr("transform", "translate(" + width*.5 + "," + height*.5 + ")");
    fg = svg.append("g").attr("transform", "translate(" + width*.5 + "," + height*.5 + ")");

let arc = d3.arc()

modeOrder = {
    'Locrian':-3,
    'Phrygian':-2,
    'Aeolian':-1,
    'Dorian':0,
    'Mixolydian':1,
    'Ionian':2,
    'Lydian':3
}

noteOrder = {
    2 : 0, // D 
    9 : 1, // A
    4 : 2, // E
    11: 3, // B
    6 : 4, // F♯/G♭
    1 : 5, // C♯/D♭
    8 : 6, // G♯/A♭
    7 : -1, // G
    0 : -2, // C
    5 : -3, // F
    10: -4, // A♯/B♭
    3 : -5, // D♯/E♭
}


let rScale = d3.scaleLinear().domain([-3,3]).range([0.3 * Math.min(height/2, width/2), 0.9 * Math.min(height/2, width/2)])
let rScale2 = d3.scaleLinear().domain([-3,3]).range([0.2, 0.65])
let aScale = d3.scaleLinear().domain([0, 12]).range([0, 2 * Math.PI])

wedges = bg.selectAll('.wedge').data(data).enter().append('g')

wedges.append('path')
    .attr('class','wedge')
    .attr('d', d => arc({innerRadius: rScale(modeOrder[d.mode] - 0.5), 
                            outerRadius: rScale(modeOrder[d.mode] + 0.5), 
                            startAngle: aScale(noteOrder[d.rootNote] - 0.5),
                            endAngle: aScale(noteOrder[d.rootNote] + 0.5),
                            }))
    .style('fill', d => d3.hcl(d.rootNote * 30 + modeOrder[d.mode] * 30/7 - 30, 80, 100 * rScale2(modeOrder[d.mode])))

wedges.append('text')
    .attr('text-anchor', 'middle')
    .attr('transform', d => {
        let centroid = arc.centroid({innerRadius: rScale(modeOrder[d.mode] - 0.5), 
                            outerRadius: rScale(modeOrder[d.mode] + 0.5), 
                            startAngle: aScale(noteOrder[d.rootNote] - 0.5),
                            endAngle: aScale(noteOrder[d.rootNote] + 0.5),
                            });
        return `translate(${centroid[0]},${centroid[1]}) rotate(${aScale(noteOrder[d.rootNote]) * 180 / Math.PI})`;
    })
    .attr('font-size', '.8em')
    .style('fill', d => d3.hcl(d.rootNote * 30 + modeOrder[d.mode] * 30/7 - 30, 50, 100 + 100 * rScale2(modeOrder[d.mode])))
    .text(d => `${d.root} ${d.mode}`)

wedges.append('text')
    .attr('text-anchor', 'middle')
    .attr('transform', d => {
        let centroid = arc.centroid({innerRadius: rScale(modeOrder[d.mode] - 0.5), 
                            outerRadius: rScale(modeOrder[d.mode] + 0.5), 
                            startAngle: aScale(noteOrder[d.rootNote] - 0.5),
                            endAngle: aScale(noteOrder[d.rootNote] + 0.5),
                            });
        return `translate(${centroid[0]},${centroid[1]}) rotate(${aScale(noteOrder[d.rootNote]) * 180 / Math.PI})`;
    })
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
    .attr('d', d => arc({innerRadius: rScale(modeOrder[d.mode] - 0.5), 
                            outerRadius: rScale(modeOrder[d.mode] + 0.5), 
                            startAngle: aScale(noteOrder[d.rootNote] - 0.5),
                            endAngle: aScale(noteOrder[d.rootNote] + 0.5),
                            }))
    .style('fill', 'none')
    .style('stroke', 'white')
    .style('stroke-width', '5px')

// test = getModeNoteNames(8, 'Dorian')
// console.log(test)

// test = getModeNoteNames(4, 'Locrian')