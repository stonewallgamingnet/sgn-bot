import { it, describe, expect, beforeAll, afterAll, afterEach, beforeEach } from "vitest";
import { getMatches, formatOutput } from "./transwarp";
import transwarps from '../transwarp_data.json';

it('returns matches', () => {
    const searchString = 'sol';

    let results = getMatches(transwarps, searchString);

    expect(Array.isArray(results)).toBeTruthy();
    expect(results.length).toBe(5);
});

it('return no matches', () => {
    const searchString = 'nonsense'

    let results = getMatches(transwarps, searchString);

    expect(Array.isArray(results)).toBeTruthy();
    expect(results.length).toBe(0);
});

it('formats the output', () => {
    const matches = [
        {
            episodename: 'Iconian War',
            missionname: 'Blood of Ancients',
            quadrant: 'Beta',
            sector: 'Vulcan',
            destination: 'Sol',
            transwarptype: 'mission'
        },
        {
            destination: "Sol System",
            quadrant: "Beta",
            sector: "Vulcan",
            transwarptype: "builtin-fed",
            requirement: "Reach level 1"
        },
        {
            destination: "Qo'noS System",
            quadrant: "Beta",
            sector: "Qo'noS",
            transwarptype: "builtin-kdf",
            requirement: "Reach level 4"
        },
        {
            destination: "New Romulus System",
            quadrant: "Beta",
            sector: "Azure",
            transwarptype: "builtin-rom",
            requirement: "Reach level 10"
        },
        {
            destination: "Deep Space Nine",
            quadrant: "Alpha",
            sector: "Bajor",
            transwarptype: "builtin-dom",
            requirement: "None"
        },
        {
            destination: "Starbase K7, Sherman System",
            quadrant: "Beta",
            sector: "Aldebaran",
            transwarptype: "builtin-fed-align",
            requirement: "Diplomacy Rank II (Consul)"
        },
        {
            destination: "Romulan Space",
            quadrant: "Beta",
            sector: "Vendor",
            transwarptype: "builtin-kdf-align",
            requirement: "Marauding Rank II (Privateer)"
        },
        {
            destination: "Deep Space Nine/Cardassian Space",
            quadrant: "Alpha",
            sector: "Bajor",
            transwarptype: "builtin-unaligned",
            requirement: "Diplomacy Rank IV (Ambassador) or Marauding Rank IV (Marauder)"
        },
        {
            destination: "Vulcan System",
            quadrant: "Beta",
            sector: "Vulcan",
            transwarptype: "fleet-fed",
            requirement: "Fleet Starbase Tranwarp Conduit at Tier 1"
        },
        {
            destination: "Rura Penthe System",
            quadrant: "Beta",
            sector: "Rura Penthe",
            transwarptype: "fleet-kdf",
            requirement: "Fleet Starbase Tranwarp Conduit at Tier 1"
        },
        {
            destination: "Regulus System",
            quadrant: "Beta",
            sector: "Regulus",
            transwarptype: "fleet-unaligned",
            requirement: "Fleet Starbase Tranwarp Conduit at Tier 2"
        },
        {
            destination: "Delta Quadrant",
            quadrant: "Delta",
            sector: "Alsuran",
            transwarptype: "rep",
            requirement: "Tier 1 in Delta Alliance reputation"
        },
    ];

    const result = formatOutput(matches);

    expect(result).toBeTypeOf('string');
    expect(result.includes('Iconian War') && result.includes('episode')).toBeTruthy();
    expect(result.includes('Sol System') && result.includes('Federation captains')).toBeTruthy();
    expect(result.includes("Qo'noS System") && result.includes('KDF captains')).toBeTruthy();
    expect(result.includes("New Romulus System") && result.includes('Romulan captains')).toBeTruthy();
    expect(result.includes("Deep Space Nine") && result.includes('Dominion captains')).toBeTruthy();
    expect(result.includes("Starbase K7, Sherman System") && result.includes('Federation-aligned captains')).toBeTruthy();
    expect(result.includes("Romulan Space") && result.includes('KDF-aligned captains')).toBeTruthy();
    expect(result.includes("Deep Space Nine/Cardassian Space") && result.includes('all captains')).toBeTruthy();
    expect(result.includes("Vulcan System") && result.includes('Federation captains') && result.includes('Fleet Transwarp Conduit')).toBeTruthy();
    expect(result.includes("Rura Penthe System") && result.includes('KDF captains') && result.includes('Fleet Transwarp Conduit')).toBeTruthy();
    expect(result.includes("Regulus System") && result.includes('all captains') && result.includes('Fleet Transwarp Conduit')).toBeTruthy();
    expect(result.includes("Delta Quadrant") && result.includes('Reputation System'));
})