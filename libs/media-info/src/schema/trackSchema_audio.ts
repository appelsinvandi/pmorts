import { z } from 'zod'
import { dateSchema, languageSchema, yesNoBooleanSchema } from './helpers'
import { encodableTextSchema } from './helpers/titleSchema'

export const trackSchema_audio = z
  .object({
    '@type': z.literal('Audio'),
    '@typeorder': z.coerce.number().int().nonnegative().optional(),
    StreamOrder: z.union([z.coerce.number().int().nonnegative(), z.string().regex(/^\d+-\d+$/)]).optional(),
    FirstPacketOrder: z.coerce.number().int().nonnegative().optional(),
    ID: z.coerce.number().int().nonnegative().optional(),
    MenuID: z.coerce.number().int().nonnegative().optional(),
    UniqueID: z.string().optional(),
    OriginalSourceMedium_ID: z.coerce.number().optional(),

    Title: encodableTextSchema.optional(),
    Language: languageSchema,

    Format: z.enum(['AAC', 'AC-3', 'DTS', 'E-AC-3', 'FLAC', 'MLP FBA', 'MPEG Audio', 'Opus', 'Vorbis', 'WMA']),
    Format_Profile: z.enum(['Layer 2', 'Layer 3']).optional(),
    Format_Version: z.coerce.number().int().positive().optional(),
    Format_AdditionalFeatures: z.enum(['16-ch', 'ES XXCH', 'JOC', 'LC', 'LC SBR', 'LTP', 'Main', 'XLL']).optional(),
    Format_Settings_Mode: z.enum(['16', 'Dolby Surround', 'Dolby Surround EX', 'Joint stereo']).optional(),
    Format_Settings_ModeExtension: z.enum(['MS Stereo']).optional(),
    Format_Settings_Floor: z.enum(['1']).optional(),
    Format_Settings_PS: z.enum(['No (Explicit)']).optional(),
    Format_Settings_SBR: z.enum(['Yes (Explicit)', 'Yes (Implicit)', 'Yes (NBC)', 'No (Explicit)']).optional(),
    Format_Commercial_IfAny: z
      .enum([
        'Dolby Digital Plus with Dolby Atmos',
        'Dolby Digital Plus',
        'Dolby Digital',
        'Dolby TrueHD',
        'Dolby TrueHD with Dolby Atmos',
        'DTS-ES Discrete',
        'DTS-HD Master Audio',
        'HE-AAC',
      ])
      .optional(),
    Format_Settings_Endianness: z.enum(['Big']).optional(),
    CodecID: z
      .enum([
        '10-2',
        '15-2',
        '161',
        '2',
        '55',
        'A_AAC-1',
        'A_AAC-2',
        'A_AC3',
        'A_DTS',
        'A_EAC3',
        'A_FLAC',
        'A_OPUS',
        'A_TRUEHD',
        'A_VORBIS',
        'ac-3',
        'mp4a-40-2',
        'mp4a-40-4',
        'mp4a-40-5',
        'mp4a-A9',
      ])
      .optional(),

    MuxingMode: z.enum(['ADTS', 'Header stripping']).optional(),

    Duration: z.coerce.number().positive(),
    Duration_LastFrame: z.coerce.number().min(-1).max(1).optional(),
    Source_Duration: z.coerce.number().positive().optional(),
    Source_Duration_LastFrame: z.coerce.number().min(-1).max(1).optional(),
    Delay: z.coerce.number().nonnegative().optional(),
    Delay_DropFrame: yesNoBooleanSchema.optional(),
    Delay_Source: z.enum(['Container', 'Stream']).optional(),
    Video_Delay: z.coerce.number().optional(),

    BitRate_Mode: z.enum(['CBR', 'VBR']).optional(),
    BitRate: z.coerce.number().positive().optional(),
    BitRate_Nominal: z.coerce.number().positive().optional(),
    BitRate_Maximum: z.coerce.number().positive().optional(),

    Channels: z.coerce.number().int().positive(),
    ChannelPositions: z
      .string()
      .transform((e) => e.split(/, */g))
      .optional(),
    ChannelLayout: z
      .string()
      .transform((e) => e.split(' '))
      .pipe(z.enum(['C', 'Cb', 'L', 'LFE', 'Lb', 'Ls', 'Lw', 'M', 'R', 'Rb', 'Rs', 'Rw']).array())
      .optional(),

    SamplesPerFrame: z.coerce.number().int().positive().optional(),
    SamplingRate: z.coerce.number().int().positive(),
    SamplingCount: z.coerce.number().int().positive(),
    BitDepth: z.enum(['16', '24', '32']).optional(),
    BitDepth_Detected: z.enum(['16', '20']).optional(),

    FrameRate: z.coerce.number().positive().optional(),
    FrameCount: z.coerce.number().int().positive().optional(),
    Source_FrameCount: z.coerce.number().int().positive().optional(),

    Compression_Mode: z.enum(['Lossless', 'Lossy']).optional(),

    StreamSize: z.coerce.number().int().positive().optional(),
    StreamSize_Proportion: z.coerce.number().positive().optional(),
    Source_StreamSize: z.coerce.number().int().positive().optional(),
    Source_StreamSize_Proportion: z.coerce.number().positive().optional(),

    Alignment: z.enum(['Aligned', 'Split']).optional(),
    Interleave_VideoFrames: z.coerce.number().positive().optional(),
    Interleave_Duration: z.coerce.number().positive().optional(),
    Interleave_Preload: z.coerce.number().positive().optional(),

    Default: yesNoBooleanSchema.optional(),
    Forced: yesNoBooleanSchema.optional(),

    ServiceKind: z.enum(['CM', 'ME']).optional(),
    AlternateGroup: z.coerce.number().int().positive().optional(),

    Encoded_Library: encodableTextSchema.optional(),
    Encoded_Library_Name: z.string().optional(),
    Encoded_Library_Version: z.string().optional(),
    Encoded_Library_Settings: z.string().optional(),
    Encoded_Library_Date: dateSchema.optional(),

    extra: z.record(z.string()).optional(),

    Encoded_Date: dateSchema.optional(),
    Tagged_Date: dateSchema.optional(),
  })
  .strict()
