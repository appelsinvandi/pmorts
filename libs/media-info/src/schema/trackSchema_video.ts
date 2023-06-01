import { z } from 'zod'
import { dateSchema, encodableTextSchema, languageSchema, yesNoBooleanSchema } from './helpers/index.js'

export const trackSchema_video = z
  .object({
    '@type': z.literal('Video'),
    '@typeorder': z.coerce.number().int().nonnegative().optional(),
    StreamOrder: z.union([z.coerce.number().int().nonnegative(), z.string().regex(/^\d+-\d+$/)]).optional(),
    FirstPacketOrder: z.coerce.number().int().nonnegative().optional(),
    ID: z.coerce.number().int().nonnegative().optional(),
    MenuID: z.coerce.number().int().nonnegative().optional(),
    UniqueID: z.string().optional(),

    Title: encodableTextSchema.optional(),

    Language: languageSchema,

    Format: z.enum(['AV1', 'AVC', 'HEVC', 'MPEG Video', 'MPEG-4 Visual', 'Sorenson Spark', 'VC-1']),
    Format_Version: z.coerce.number().int().positive().optional(),
    Format_Profile: z
      .enum([
        'Advanced Simple',
        'Baseline',
        'Format Range',
        'High',
        'High 10',
        'High 4:4:4 Predictive',
        'Main',
        'Main 10',
        'MP',
        'Progressive High',
        'Simple',
      ])
      .optional(),
    Format_Level: z
      .enum(['1', '1.3', '3', '3.1', '3.2', '4', '4.1', '4.2', '5', '5.1', '5.2', '6.2', 'High 1440', 'HL'])
      .optional(),
    Format_Tier: z.enum(['High', 'Main']).optional(),
    Format_Settings_CABAC: yesNoBooleanSchema.optional(),
    Format_Settings_RefFrames: z.coerce.number().int().positive().optional(),
    Format_Settings_BVOP: z.union([yesNoBooleanSchema, z.literal('1'), z.literal('2')]).optional(),
    Format_Settings_GMC: z.literal('0').pipe(z.coerce.number()).optional(),
    Format_Settings_GOP: z
      .string()
      .regex(/^(M=\d+, N=\d+|N=\d+)$/, { message: 'does not match pattern' })
      .optional(),
    Format_Settings_QPel: yesNoBooleanSchema.optional(),
    Format_Settings_Matrix: z.enum(['Default', 'Default (H.263)']).optional(),
    MuxingMode: z.string().optional(),
    CodecID: z
      .enum([
        '2',
        '27',
        '7',
        'av01',
        'avc1',
        'H264',
        'hev1',
        'mp4v-20',
        'V_MPEG4/ISO/AVC',
        'V_MPEGH/ISO/HEVC',
        'WMV3',
        'XVID',
      ])
      .optional(),

    Duration: z.coerce.number().positive().optional(),
    Source_Duration: z.coerce.number().positive().optional(),
    Duration_FirstFrame: z.coerce.number().optional(),
    Duration_LastFrame: z.coerce.number().optional(),
    Source_Duration_LastFrame: z.coerce.number().optional(),
    Delay: z.coerce.number().nonnegative().optional(),
    Delay_Original: z.coerce.number().nonnegative().optional(),
    Delay_Source: z.enum(['Container']).optional(),
    TimeCode_FirstFrame: z
      .string()
      .regex(/^\d{2}:\d{2}:\d{2}[;:]\d{2}$/)
      .optional(),
    TimeCode_Source: z.enum(['Group of pictures header']).optional(),
    Gop_OpenClosed: z.enum(['Closed']).optional(),

    BitRate_Mode: z.enum(['CBR', 'VBR']).optional(),
    BitRate: z.coerce.number().int().positive().optional(),
    BitRate_Nominal: z.coerce.number().int().positive().optional(),
    BitRate_Maximum: z.coerce.number().int().positive().optional(),

    Width: z.coerce.number().int().positive(),
    Width_Original: z.coerce.number().int().positive().optional(),
    Width_CleanAperture: z.coerce.number().int().positive().optional(),
    Height: z.coerce.number().int().positive(),
    Height_Original: z.coerce.number().int().positive().optional(),
    Stored_Width: z.coerce.number().int().positive().optional(),
    Stored_Height: z.coerce.number().int().positive().optional(),
    Sampled_Width: z.coerce.number().int().positive().optional(),
    Sampled_Height: z.coerce.number().int().positive().optional(),
    PixelAspectRatio: z.coerce.number().positive(),
    PixelAspectRatio_Original: z.coerce.number().positive().optional(),
    DisplayAspectRatio: z.coerce.number().positive(),
    DisplayAspectRatio_Original: z.coerce.number().positive().optional(),
    Rotation: z.coerce.number().nonnegative().default(0),

    FrameRate: z.coerce.number().positive().optional(),
    FrameRate_Minimum: z.coerce.number().positive().optional(),
    FrameRate_Maximum: z.coerce.number().positive().optional(),
    FrameRate_Original: z.coerce.number().positive().optional(),
    FrameRate_Mode: z.enum(['CFR', 'VFR']).optional(),
    FrameRate_Mode_Original: z.enum(['VFR']).optional(),
    FrameRate_Num: z.coerce.number().int().positive().optional(),
    FrameRate_Den: z.coerce.number().int().positive().optional(),
    FrameCount: z.coerce.number().int().positive().optional(),

    Standard: z.enum(['Component', 'NTSC', 'PAL']).optional(),

    Encoded_Library: z.string().optional(),
    Encoded_Library_Name: z.string().optional(),
    Encoded_Library_Version: z.string().optional(),
    Encoded_Library_Settings: z.string().optional(),
    Encoded_Library_Date: dateSchema.optional(),

    ColorSpace: z.enum(['YUV']).optional(),
    ChromaSubsampling: z.enum(['4:2:0', '4:2:2', '4:4:4']).optional(),
    ChromaSubsampling_Position: z.enum(['Type 0', 'Type 2']).optional(),
    BitDepth: z.coerce.number().int().positive(),
    ScanOrder: z.enum(['TFF']).optional(),
    ScanType: z.enum(['Interlaced', 'Progressive']).optional(),
    colour_description_present: yesNoBooleanSchema.optional(),
    colour_description_present_Source: z.enum(['Container', 'Container / Stream', 'Stream']).optional(),
    colour_range: z.enum(['Full', 'Limited']).optional(),
    colour_range_Source: z.enum(['Container', 'Container / Stream', 'Stream']).optional(),
    colour_primaries: z.enum(['BT.2020', 'BT.601 NTSC', 'BT.601 PAL', 'BT.709', 'Display P3']).optional(),
    colour_primaries_Source: z.enum(['Container', 'Container / Stream', 'Stream']).optional(),
    transfer_characteristics: z.enum(['BT.470 System B/G', 'BT.470 System M', 'BT.601', 'BT.709', 'PQ']).optional(),
    transfer_characteristics_Source: z.enum(['Container', 'Container / Stream', 'Stream']).optional(),
    matrix_coefficients: z.enum(['BT.2020 non-constant', 'BT.470 System B/G', 'BT.601', 'BT.709']).optional(),
    matrix_coefficients_Source: z.enum(['Container', 'Container / Stream', 'Stream']).optional(),

    StreamSize: z.coerce.number().int().positive().optional(),
    Source_StreamSize: z.coerce.number().int().positive().optional(),
    BufferSize: z
      .union([
        z.coerce.number().int().positive(),
        z.string().regex(/^\d+ \/ \d+$/, { message: 'does not match pattern' }),
      ])
      .optional(),
    Compression_Mode: z.enum(['Lossy']).optional(),

    Default: yesNoBooleanSchema.optional(),
    Forced: yesNoBooleanSchema.optional(),

    extra: z.record(z.string()).optional(),

    Encoded_Date: dateSchema.optional(),
    Tagged_Date: dateSchema.optional(),
  })
  .strict()
