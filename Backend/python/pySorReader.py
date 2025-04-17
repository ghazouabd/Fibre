import json
import matplotlib.pyplot as plt
import struct
import re
from datetime import datetime
from pprint import pprint as pp
from matplotlib.backends.backend_pdf import PdfPages
from matplotlib.table import Table
import pandas as pd
import os
import json
import matplotlib.pyplot as plt
import struct
import re
from datetime import datetime
from pprint import pprint as pp
from matplotlib.backends.backend_pdf import PdfPages
from matplotlib.table import Table
import pandas as pd

class sorReader:
    def __init__(self, filename):
        self.filename = filename
        self.jsonoutput = {}
        self.c = 299.79181901
        try:
            with open(filename, "rb") as rawdata:
                self.rawdecodedfile = rawdata.read()
        except FileNotFoundError:
            print("file {} not found!".format(self.extractFileName(filename)))
            return
        self.hexdata = self.rawdecodedfile.hex()
        self.decodedfile = "".join(list(map(chr, self.rawdecodedfile)))
        self.SecLocs = self.GetOrder()
        self.jsonoutput["bellcoreVersion"] = self.bellcore_version()
        if "2.1" not in str(self.jsonoutput["bellcoreVersion"]):
            print("This script works best with bellcore Version 2.1 and may not be completely compatible with this file: {}.".format(self.jsonoutput["bellcoreVersion"]))
        self.jsonoutput["totalLoss_dB"] = self.totalloss()
        self.jsonoutput["vacuumSpeed_m/us"] = self.c
        self.jsonoutput.update(self.SupParams())
        self.jsonoutput.update(self.genParams())
        self.jsonoutput.update(self.fixedParams())

        self.dataPts()  # This now reads both power and amplitude
        self.jsonoutput["events"] = self.keyEvents()
        self.jsonoutput["fiberLength_m"] = self.fiberlength()
    def GetNext(self, key):
        if key not in self.SecLocs:
            return None
        
        index = self.SecLocs[key][0]
        next_key = None
        next_index = float('inf')
        
        for k, v in self.SecLocs.items():
            if k == key or not v:
                continue
            if index < v[0] < next_index:
                next_index = v[0]
                next_key = k
        
        return next_key
    
    def extractFileName(self, absolutePath):
        return absolutePath.split("/")[-1]

    def GetOrder(self):
        sections = [
            "SupParams", "ExfoNewProprietaryBlock", "Map", "FxdParams",
            "DataPts", "NokiaParams", "KeyEvents", "GenParams",
            "WaveMTSParams", "WavetekTwoMTS", "WavetekThreeMTS",
            "BlocOtdrPrivate", "ActernaConfig", "ActernaMiniCurve",
            "JDSUEvenementsMTS", "Cksum"
        ]

        SectionLocations = {}
        for word in sections:
            SectionLocations[word] = [m.start() for m in re.finditer(word, self.decodedfile)]
        if len(SectionLocations['Cksum']) < 2:
            print(self.filename, " file has no checksum")
            exit()
        return SectionLocations

    def return_index(self, data, v):
        closest = (float('inf'), 0)
        for i in data:
            if i[0] == v:
                return i[1]
            if abs(v-i[0]) < abs(v - closest[0]) and i[0] < v:
                closest = i
        else:
            return closest[1]
             
    def plotter(self, save_pdf=False):
        # Create figure with two subplots
        fig = plt.figure(figsize=(14, 12))
        gs = fig.add_gridspec(2, 1, height_ratios=[2, 1])
        ax1 = fig.add_subplot(gs[0])
        ax2 = fig.add_subplot(gs[1])
        
        # Plot the OTDR trace
        ax1.plot(self.distances, self.powers, color='darkgreen', lw=1.3)
        ax1.grid(True, color='gray', linestyle='--', linewidth=0.5)
        ax1.tick_params(color='dimgray', labelcolor='dimgray')
        ax1.set(xlabel='Fiber Length (m)', ylabel='Optical Power (dB)', 
               title='OTDR Graph')

        # Prepare event data for table
        event_data = []
        for ev in self.jsonoutput["events"]:
            ev_info = self.jsonoutput["events"][ev]
            ev_location = ev_info['eventPoint_m']
            loc = self.return_index(self.dataset, ev_location)
            if loc is None:
                continue

            # Add simple marker to graph
            ax1.plot(ev_location, loc, 'ro', markersize=5)
            
            # Add event to table data
            event_data.append([
                ev,
                ev_info['eventType'],
                round(ev_location, 1),
                round(loc, 3),
                ev_info['spliceLoss_dB'],
                ev_info['reflectionLoss_dB'],
                ev_info['comment'][:50]  # Limit comment length
            ])

        # Create and display table
        if event_data:
            columns = ['Event#', 'Type', 'Location (m)', 'Power (dB)', 
                      'Loss (dB)', 'Reflection (dB)', 'Comment']
            df = pd.DataFrame(event_data, columns=columns)
            
            # Hide axes for table
            ax2.axis('off')
            
            # Create table and add to subplot
            table = ax2.table(cellText=df.values,
                             colLabels=df.columns,
                             loc='center',
                             cellLoc='center')
            
            # Style the table
            table.auto_set_font_size(False)
            table.set_fontsize(8)
            table.scale(1, 1.2)
            
            # Highlight header
            for (i, j), cell in table.get_celld().items():
                if i == 0:
                    cell.set_text_props(weight='bold')
                    cell.set_facecolor('#dddddd')

        plt.tight_layout()
        
        # Save to PDF if requested
        if save_pdf:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            frontend_dir = os.path.abspath(os.path.join(
            current_dir,
            '..', '..',           # Remonter à FIBRE-ESSAI/
            'frontend',
            'public',
            'reports'
        ))
            print(f"[DEBUG] Chemin absolu : {frontend_dir}")
            os.makedirs(frontend_dir, exist_ok=True)

            
            pdf_name = os.path.basename(self.filename).replace(".sor", ".pdf").replace(".SOR", ".pdf")
            pdf_path = os.path.join(frontend_dir, pdf_name)
            with PdfPages(pdf_path) as pdf:
                pdf.savefig(fig, bbox_inches='tight')
                # Add metadata
                d = pdf.infodict()
                d['Title'] = 'OTDR Analysis Report'
                d['Author'] = 'sorReader'
                d['Subject'] = 'OTDR Trace and Event Analysis'
            print(f"Report saved to {pdf_path}")
        
        plt.show()
        return df

    def hexparser(self, cleanhex, mode=""):
        if mode == "schmutzig":
            return int(''.join(hex(ord(c))[2:] for c in reversed(cleanhex)), 16)
        elif mode == "schreiben":
            return bytes.fromhex(cleanhex).decode()
        elif mode == "loss":
            return struct.unpack('h', bytes.fromhex(cleanhex))[0]
        else:
            return int("0x"+"".join([cleanhex[i:i+2] for i in range(0, len(cleanhex), 2)][::-1]), 0) 

    def jsondump(self):
        with open(self.filename.replace(".sor", ".json").replace(".SOR", ".json"), "w") as output:
            json.dump(self.jsonoutput, output, indent=4)

    def bellcore_version(self):
        return self.hexparser((self.hexdata[(self.SecLocs["Map"][0]+4)*2:(self.SecLocs["Map"][0]+5)*2])) / 100

    def totalloss(self):
        if self.SecLocs["WaveMTSParams"] != []:
            try:
                totallossinfo = self.hexdata[(self.SecLocs["WaveMTSParams"][1]-22)*2:(self.SecLocs["WaveMTSParams"][1]-18)*2]
                return str(round(self.hexparser(totallossinfo)*0.001, 3))
            except Exception as e:
                print(self.extractFileName(self.filename) + ": " + str(e))
        else:
            return 0

    def fiberlength(self):
        for _, ev in self.jsonoutput["events"].items():
            if "EXXX" in ev['eventType'] or "E999" in ev['eventType']:
                return ev['eventPoint_m']
        else:
            return 0

    def SupParams(self):
        supInfos = {}
        supInfo = self.decodedfile[self.SecLocs["SupParams"][1]+10:self.SecLocs[self.GetNext("SupParams")][1]].split("\x00")[:-1]
        supInfos["otdrSupplier"] = supInfo[0].strip()
        supInfos["otdrName"] = supInfo[1].strip()
        supInfos["otdrSN"] = supInfo[2].strip()
        supInfos["otdrModuleName"] = supInfo[3].strip()
        supInfos["otdrModuleSN"] = supInfo[4].strip()
        supInfos["otdrSwVersion"] = supInfo[5].strip()
        supInfos["otdrOtherInfo"] = supInfo[6].strip()
        return supInfos
        
    def genParams(self):
        genInfos = {}
        genInfo = self.decodedfile[self.SecLocs["GenParams"][1]+10:self.SecLocs[self.GetNext("GenParams")][1]].split("\x00")[:-1]
        genInfos["lang"] = genInfo[0][:2].strip()
        genInfos["cableId"] = genInfo[0][2:].strip()
        genInfos["fiberId"] = genInfo[1].strip()
        genInfos["locationA"] = genInfo[2][4:].strip()
        genInfos["locationB"] = genInfo[3].strip()
        genInfos["buildCondition"] = genInfo[5].strip()
        genInfos["comment"] = genInfo[14].strip() if len(genInfo) > 14 else ""
        genInfos["cableCode"] = genInfo[4].strip()
        genInfos["operator"] = genInfo[13].strip() if len(genInfo) > 13 else ""
        genInfos["fiberType"] = f'G.{self.hexparser(genInfo[2][:2],"schmutzig")}'
        genInfos["otdrWavelength"] = f'{self.hexparser(genInfo[2][2:4],"schmutzig")} nm'
        return genInfos

    def fixedParams(self):
        fixInfos = {}
        fixInfo = self.hexdata[(self.SecLocs["FxdParams"][1]+10)*2:(self.SecLocs[self.GetNext("FxdParams")][1]*2)]
        p = 8
        fixInfos["dateTime"] = datetime.fromtimestamp(self.hexparser(fixInfo[:p])).strftime('%Y-%m-%d %H:%M:%S')
        fixInfos["unit"] = self.hexparser(fixInfo[p:p+4], "schreiben")
        p += 4
        fixInfos["actualWavelength_nm"] = self.hexparser(fixInfo[p:p+4]) / 10
        p += 4
        fixInfos["AO"] = self.hexparser(fixInfo[p:p+8])
        p += 8
        fixInfos["AOD"] = self.hexparser(fixInfo[p:p+8])
        p += 8
        fixInfos["pulseWidthNo"] = self.hexparser(fixInfo[p:p+4])
        p += 4

        fixInfos["pulseWidth_ns"] = []
        for _ in range(fixInfos["pulseWidthNo"]):
            fixInfos["pulseWidth_ns"].append(self.hexparser(fixInfo[p:p+4]))
            p += 4

        resolution_m_p1 = []
        for _ in range(fixInfos["pulseWidthNo"]):
            resolution_m_p1.append(self.hexparser(fixInfo[p:p+8]) * (10 ** -8))
            p += 8

        fixInfos["sampleQty"] = []
        for _ in range(fixInfos["pulseWidthNo"]):
            fixInfos["sampleQty"].append(self.hexparser(fixInfo[p:p+8]))
            p += 8
        
        fixInfos['ior'] = self.hexparser(fixInfo[p:p+8])
        p += 8
        fixInfos["refractionIndex"] = fixInfos['ior'] * (10 ** -5)
        fixInfos["fiberLightSpeed_km/ms"] = self.c / fixInfos['refractionIndex']

        fixInfos["resolution_m"] = []
        for i in range(fixInfos["pulseWidthNo"]):
            fixInfos["resolution_m"].append(resolution_m_p1[i] * fixInfos["fiberLightSpeed_km/ms"])
        
        fixInfos["backscatteringCo_dB"] = self.hexparser(fixInfo[p:p+4]) * -0.1
        p += 4
        fixInfos["averaging"] = self.hexparser(fixInfo[p:p+8])
        p += 8
        fixInfos["averagingTime_M"] = round(self.hexparser(fixInfo[p:p+4])/600, 3)
        p += 4

        fixInfos["range_m"] = []
        for i in range(fixInfos["pulseWidthNo"]):
            fixInfos["range_m"].append(round(fixInfos["sampleQty"][i] * fixInfos["resolution_m"][i], 3))

        return fixInfos

    def dataPts(self):
        def dB(point):
            return point * -1000 * (10 ** -6)
        
        def amplitude(point):
            return point  # Raw amplitude value
    
        dtpoints = self.hexdata[self.SecLocs["DataPts"][1]*2:self.SecLocs[self.GetNext("DataPts")][1]*2][40:]
        self.dataset = []
        self.amplitude_dataset = []  # New list to store amplitude values

        start = 0
        cumulative_length = 0

        for i in range(len(self.jsonoutput['sampleQty'])):
            qty = self.jsonoutput['sampleQty'][i]
            resolution = self.jsonoutput['resolution_m'][i]

            for j in range(qty):
                index = start + j
                if index < len(dtpoints):
                    hex_value = dtpoints[index*4:index*4 + 4]
                    raw_value = self.hexparser(hex_value)
                    db_value = dB(raw_value)
                    amp_value = amplitude(raw_value)
                    passedlen = round(cumulative_length, 3)
                    self.dataset.append((passedlen, db_value))
                    self.amplitude_dataset.append((passedlen, amp_value))
                    cumulative_length += resolution
            start += qty
        
        self.distances = [t[0] for t in self.dataset]
        self.powers = [z[1] for z in self.dataset]
        self.amplitudes = [a[1] for a in self.amplitude_dataset]  # Store amplitudes

    def exportAsCsv(self):
        self.ANN_LABEL = {}
        
        for ev in self.jsonoutput["events"]:
            ev_location = self.jsonoutput["events"][ev]['eventPoint_m']
            loc = self.return_index(self.dataset, ev_location)

            if loc is None:
                continue
            
            self.ANN_LABEL[ev_location] = 1

        with open(self.filename.replace(".sor", ".csv"), "w") as o:
            o.write("Distance (m),Power (dB),Amplitude,Event\n")  # Added Amplitude column
            for l in range(len(self.distances)):
                e = self.ANN_LABEL.get(self.distances[l]) if self.ANN_LABEL.get(self.distances[l]) == 1 else 0
                o.write(f'{self.distances[l]},{self.powers[l]},{self.amplitudes[l]},{e}\n')  # Added amplitude value

            o.flush()

    def mapKeyEvents(self, events):
        m = {}
        start = 4
        evnumbers = self.hexparser(events[:start])
        for i in range(1, evnumbers+1):
            if i == evnumbers:
                m[i] = (start, len(events)-46)
            else:
                end = events.find(format(i+1, '02x') + '00', start+84)
                m[i] = (start, end)
                start = end
        return m
    
    def keyEvents(self):
        keyevents = {}
        events = self.hexdata[(self.SecLocs["KeyEvents"][1]+10)*2:self.SecLocs[self.GetNext("KeyEvents")][1]*2]
        p = self.mapKeyEvents(events)
        eventhexlist = [events[v[0]:v[1]] for v in list(p.values())]
        for e in eventhexlist:
            try:
                eNum = self.hexparser(e[:4])
                keyevents[eNum] = {}
                keyevents[eNum]["eventPoint_m"] = self.hexparser(e[4:12]) * (10 ** -4) * self.jsonoutput["fiberLightSpeed_km/ms"]
                stValue = keyevents[eNum]["eventPoint_m"] % self.jsonoutput["resolution_m"][0]
                if stValue >= self.jsonoutput["resolution_m"][0] / 2:
                    keyevents[eNum]["eventPoint_m"] = round(keyevents[eNum]["eventPoint_m"] + (self.jsonoutput["resolution_m"][0] - stValue), 3)
                else:
                    keyevents[eNum]["eventPoint_m"] = round(keyevents[eNum]["eventPoint_m"] - stValue, 3)
                keyevents[eNum]["slope"] = round(self.hexparser(e[12:16]) * 0.001, 3)
                keyevents[eNum]["spliceLoss_dB"] = round(self.hexparser(e[16:20], "loss") * 0.001, 3)
                keyevents[eNum]["reflectionLoss_dB"] = round((self.hexparser(e[20:28]) - (2**32)) * 0.001 if self.hexparser(e[20:28]) > 0 else self.hexparser(e[20:28]), 3)
                keyevents[eNum]["eventType"] = self.hexparser(e[28:44], "schreiben")
                keyevents[eNum]["endOfPreviousEvent"] = self.hexparser(e[44:52])
                keyevents[eNum]["beginningOfCurrentEvent"] = self.hexparser(e[52:60])
                keyevents[eNum]["endOfCurrentEvent"] = self.hexparser(e[60:68])
                keyevents[eNum]["beginningOfNextEvent"] = self.hexparser(e[68:76])
                keyevents[eNum]["peakpointInCurrentEvent"] = self.hexparser(e[76:84])
                keyevents[eNum]["comment"] = "NA"
                try:
                    if len(e) > 88:
                        if len(e) < 102:
                            keyevents[eNum]["comment"] = self.hexparser(e[84:], "schreiben")
                        else:
                            keyevents[eNum]["comment"] = self.hexparser(e[84:102], "schreiben")
                except:
                    print(self.extractFileName(self.filename) + ": Failed to parse EOF Comment.")
            except:
                print(self.extractFileName(self.filename))
                pp(eventhexlist)
        return keyevents

    def exportAsCsv(self):
        self.ANN_LABEL = {}
        
        for ev in self.jsonoutput["events"]:
            ev_location = self.jsonoutput["events"][ev]['eventPoint_m']
            loc = self.return_index(self.dataset, ev_location)

            if loc is None:
                continue
            
            self.ANN_LABEL[ev_location] = 1

        with open(self.filename.replace(".sor", ".csv"), "w") as o:
            o.write("Distance (m),Power (dB),Event\n")
            for l in range(len(self.distances)):
                e = self.ANN_LABEL.get(self.distances[l]) if self.ANN_LABEL.get(self.distances[l]) == 1 else 0
                o.write(f'{self.distances[l]},{self.powers[l]},{e}\n')

            o.flush()

def find_scale(c, lenRef):
    for k, v in c.dataset:
        if k > lenRef and k < lenRef + 12:
            return (k, v)
        
def align_scales(sor_objects, ref_object, refLen):
    for s in sor_objects:
        _, vs = find_scale(s, refLen)
        _, vref = find_scale(ref_object, refLen)
        diff = vref - vs
        s.dataset = [(i, j+diff) for i, j in s.dataset]

def merge_scans(sorlist, refsor, reflen):
    align_scales(sorlist, refsor, reflen)
    cx = sorlist[0]
    allEvents = []
    for d in sorlist:
        cx.dataset += d.dataset
        allEvents += [e for _, e in d.jsonoutput["events"].items()]
    
    sorted_events = sorted(allEvents, key=lambda x: x['eventPoint_m'])
    cx.jsonoutput["events"] = {i: v for i, v in enumerate(sorted_events)}
    return cx 