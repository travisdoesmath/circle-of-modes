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

function createData() {
    let data = []

    for (let i = 0; i < 12; i++) {
        modeNames.forEach(mode => {
            data.push(getModeNoteNames(i, mode))
        })
    }

    return data;
}
